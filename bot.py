"""Voice bot. Audio out and video out stay off.

Deepgram Flux hears the caller. gpt-5.4-mini speaks. Cartesia Sonic 3.6
speaks each finished sentence. The Akapulu worker publishes the face and
the played audio. This bot listens only to the browser participant named You.
"""

import asyncio
import os

from loguru import logger
from pipecat.frames.frames import (
    LLMRunFrame,
    STTUpdateSettingsFrame,
    TranscriptionFrame,
    TTSUpdateSettingsFrame,
    UserAudioRawFrame,
)
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.flux.stt import DeepgramFluxSTTService
from pipecat.services.openai.responses.llm import OpenAIResponsesLLMService
from pipecat.services.tts_service import TextAggregationMode
from pipecat.transcriptions.language import Language
from pipecat.transports.daily.transport import DailyParams, DailyTransport
from pipecat.workers.runner import WorkerRunner
from pipecat_akapulu import AkapuluAvatar

from session import AVATAR_NAME, USER_NAME

SAMPLE_RATE = 24000
SETUP_TIMEOUT_SECS = 180.0
USER_JOIN_TIMEOUT_SECS = 180.0
SPEAKER_MODEL = "gpt-5.4-mini"
SONIC_MODEL = "sonic-3.6"
# Ariana, Kind Friend. Same voice as the Akapulu Labs hosted bot.
SONIC_VOICE_ID = "ec1e269e-9ca0-402f-8a18-58e0e022355a"
FLUX_MODEL = "flux-general-multi"
EAGER_EOT_THRESHOLD = 0.5
# Codes flux-general-multi returns, and the only codes this bot will lock.
FLUX_LANGUAGES = frozenset(
    {
        Language.DE,
        Language.EN,
        Language.ES,
        Language.FR,
        Language.HI,
        Language.IT,
        Language.JA,
        Language.NL,
        Language.PT,
        Language.RU,
    }
)
SPOKEN_INSTRUCTION = (
    "You are a voice assistant on a short test call. "
    "Say one short sentence, then wait. "
    "Speak the language of the caller's latest turn."
)
GREETING_CUE = "Say one short sentence now, then wait."


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not isinstance(value, str) or not value.strip():
        raise RuntimeError(f"{name} is missing")
    return value.strip()


def _daily_user_name(participant: dict) -> str:
    info = participant.get("info")
    if not isinstance(info, dict):
        raise RuntimeError("Daily participant has no info")
    name = info.get("userName")
    if not isinstance(name, str) or not name:
        raise RuntimeError("Daily participant has no userName")
    return name


def microphone_subscriptions(participants: dict) -> dict:
    """Subscribe the browser mic. Unsubscribe every other participant, including the avatar."""
    settings = {}
    for participant_id, participant in participants.items():
        if not isinstance(participant, dict):
            raise RuntimeError("Daily participant is not an object")
        info = participant.get("info")
        if isinstance(info, dict) and info.get("isLocal") is True:
            continue
        name = _daily_user_name(participant)
        settings[participant_id] = {
            "media": {
                "microphone": "subscribed" if name == USER_NAME else "unsubscribed",
            }
        }
    return settings


class BrowserMic(FrameProcessor):
    """Pass only the browser microphone into the model."""

    def __init__(self):
        super().__init__()
        self._browser_id: str | None = None

    def allow(self, participant_id: str) -> None:
        if self._browser_id is not None and self._browser_id != participant_id:
            raise RuntimeError("Daily browser microphone changed")
        self._browser_id = participant_id

    async def process_frame(self, frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if isinstance(frame, UserAudioRawFrame):
            if self._browser_id is None or frame.user_id != self._browser_id:
                return
        await self.push_frame(frame, direction)


class SpokenLanguage(FrameProcessor):
    """Lock Flux and Sonic to the language of the latest committed turn.

    The socket opens with no language hint, so the greeting and the first
    turn are detected. A committed turn with no Flux language, or a language
    outside the Flux set, raises. The same language does not send another
    update. A different language sends both updates again.
    """

    def __init__(self):
        super().__init__()
        self._locked: Language | None = None

    async def process_frame(self, frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if (
            direction == FrameDirection.DOWNSTREAM
            and isinstance(frame, TranscriptionFrame)
            and frame.finalized
        ):
            language = frame.language
            if language not in FLUX_LANGUAGES:
                raise RuntimeError(f"Flux committed a turn with no language: {language!r}")
            if language != self._locked:
                self._locked = language
                await self.push_frame(
                    STTUpdateSettingsFrame(
                        delta=DeepgramFluxSTTService.Settings(language_hints=[language])
                    ),
                    FrameDirection.UPSTREAM,
                )
                await self.push_frame(
                    TTSUpdateSettingsFrame(
                        delta=CartesiaTTSService.Settings(language=language)
                    ),
                    FrameDirection.DOWNSTREAM,
                )
        await self.push_frame(frame, direction)


async def run_bot(room_url: str, token: str, session_id: str) -> None:
    """Join the Daily room and run the voice pipeline until the browser leaves."""
    if not isinstance(room_url, str) or not room_url.startswith("https://"):
        raise RuntimeError("Daily room url is missing")
    if not isinstance(token, str) or not token:
        raise RuntimeError("Daily bot token is missing")
    if not isinstance(session_id, str) or not session_id:
        raise RuntimeError("session_id is missing")

    transport = DailyTransport(
        room_url,
        token,
        "Assistant",
        DailyParams(
            audio_in_enabled=True,
            audio_in_user_tracks=True,
            audio_out_enabled=False,
            video_out_enabled=False,
        ),
    )
    browser_mic = BrowserMic()
    stt = DeepgramFluxSTTService(
        api_key=_required("DEEPGRAM_API_KEY"),
        enable_eager_end_of_turn=True,
        settings=DeepgramFluxSTTService.Settings(
            model=FLUX_MODEL,
            language_hints=None,
            eager_eot_threshold=EAGER_EOT_THRESHOLD,
        ),
    )
    spoken_language = SpokenLanguage()
    llm = OpenAIResponsesLLMService(
        api_key=_required("OPENAI_API_KEY"),
        service_tier="priority",
        settings=OpenAIResponsesLLMService.Settings(
            model=SPEAKER_MODEL,
            system_instruction=SPOKEN_INSTRUCTION,
            reasoning=OpenAIResponsesLLMService.ReasoningConfig(effort="none"),
        ),
    )
    # One sentence is one Sonic clip. Delay 0 keeps Cartesia from stacking
    # its buffer on top of that wait.
    tts = CartesiaTTSService(
        api_key=_required("CARTESIA_API_KEY"),
        sample_rate=SAMPLE_RATE,
        text_aggregation_mode=TextAggregationMode.SENTENCE,
        max_buffer_delay_ms=0,
        settings=CartesiaTTSService.Settings(
            model=SONIC_MODEL,
            voice=SONIC_VOICE_ID,
            language=None,
        ),
    )
    avatar = AkapuluAvatar(session_id=session_id)
    context = LLMContext([{"role": "developer", "content": GREETING_CUE}])
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(context)
    pipeline = Pipeline(
        [
            transport.input(),
            browser_mic,
            stt,
            spoken_language,
            user_aggregator,
            llm,
            tts,
            avatar,
            transport.output(),
            assistant_aggregator,
        ]
    )
    worker = PipelineWorker(
        pipeline,
        params=PipelineParams(
            audio_out_sample_rate=SAMPLE_RATE,
            enable_metrics=True,
        ),
        setup_timeout_secs=SETUP_TIMEOUT_SECS,
    )
    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)

    joined = asyncio.Event()
    seen: set[str] = set()

    async def enforce_microphone_subscriptions() -> None:
        settings = microphone_subscriptions(dict(transport.participants()))
        if not settings:
            return
        error = await transport.update_subscriptions(participant_settings=settings)
        if error:
            raise RuntimeError(f"Daily microphone subscription failed: {error}")

    async def note_participant(participant) -> None:
        if not isinstance(participant, dict):
            raise RuntimeError("Daily participant is not an object")
        info = participant.get("info")
        if isinstance(info, dict) and info.get("isLocal") is True:
            return
        participant_id = participant.get("id")
        if not isinstance(participant_id, str) or not participant_id:
            raise RuntimeError("Daily participant has no id")
        if participant_id in seen:
            await enforce_microphone_subscriptions()
            return
        seen.add(participant_id)
        name = _daily_user_name(participant)
        logger.info("Daily participant joined {}", name)
        if name == USER_NAME:
            browser_mic.allow(participant_id)
        await enforce_microphone_subscriptions()
        if name == AVATAR_NAME:
            return
        if name != USER_NAME:
            raise RuntimeError(f"Daily participant {name} is not the browser or the avatar")
        if joined.is_set():
            raise RuntimeError("Daily browser joined twice")
        joined.set()
        await worker.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_joined")
    async def on_joined(_transport, _data):
        for participant in dict(transport.participants()).values():
            await note_participant(participant)

    @transport.event_handler("on_participant_joined")
    async def on_participant_joined(_transport, participant):
        await note_participant(participant)

    @transport.event_handler("on_participant_updated")
    async def on_participant_updated(_transport, _participant):
        await enforce_microphone_subscriptions()

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(_transport, participant):
        # Avatar can leave on a worker fault. Only the browser ending the call
        # should stop this bot.
        if not isinstance(participant, dict):
            raise RuntimeError("Daily participant is not an object")
        name = _daily_user_name(participant)
        logger.info("Daily participant left {}", name)
        if name != USER_NAME:
            return
        await runner.cancel()

    async def leave_if_alone() -> None:
        try:
            await asyncio.wait_for(joined.wait(), USER_JOIN_TIMEOUT_SECS)
        except TimeoutError:
            logger.info("Browser did not join")
            await runner.cancel()

    wait_task = asyncio.create_task(leave_if_alone())
    try:
        await runner.run()
    finally:
        wait_task.cancel()
        try:
            await wait_task
        except asyncio.CancelledError:
            pass
