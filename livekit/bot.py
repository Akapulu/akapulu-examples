"""Voice bot. Joins the LiveKit room and attaches AvatarSession.

LiveKit Inference runs Flux / GPT / Cartesia. The Akapulu worker publishes
the face and the played audio. Mute STT until wait_until_call_ready, then
greet.
"""

from __future__ import annotations

import asyncio
import logging

from livekit import rtc
from livekit.agents import Agent, AgentSession, TurnHandlingOptions, inference
from livekit.agents.utils import http_context
from livekit_akapulu import AvatarSession

from session import AGENT_IDENTITY, AVATAR_ID, SHOW_AI_LABEL

logger = logging.getLogger("akapulu.examples.livekit")

_CARTESIA_VOICE_ID = "86e30c1d-714b-4074-a1f2-1cb6b552fb49"
_EAGER_EOT_THRESHOLD = 0.5
_AVATAR_JOIN_TIMEOUT_SECS = 180.0
_ROOM_EMPTY_TIMEOUT_SECS = 2 * 60 * 60
_AVATAR_IDENTITY = "Avatar"


def _visitor_still_in_room(room: rtc.Room) -> bool:
    for participant in room.remote_participants.values():
        identity = participant.identity or ""
        if identity in (AGENT_IDENTITY, _AVATAR_IDENTITY):
            continue
        return True
    return False


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are a voice assistant on a short test call. "
                "Reply in one or two spoken sentences. "
                "Speak the language of the caller's latest turn. "
                "Do not use markdown, bullets, emoji, or stage directions."
            ),
        )


async def run_bot(
    *,
    livekit_url: str,
    agent_token: str,
    session_id: str,
) -> None:
    if not isinstance(livekit_url, str) or not (
        livekit_url.startswith("wss://") or livekit_url.startswith("ws://")
    ):
        raise RuntimeError("livekit_url must be wss://")
    if not isinstance(agent_token, str) or not agent_token.strip():
        raise RuntimeError("agent_token is missing")
    if not isinstance(session_id, str) or not session_id.strip():
        raise RuntimeError("session_id is missing")

    room = rtc.Room()
    await room.connect(livekit_url, agent_token)
    logger.info("livekit example agent joined")

    async with http_context.open():
        async with AgentSession(
            stt=inference.STT(
                model="deepgram/flux-general-multi",
                language="multi",
                extra_kwargs={"eager_eot_threshold": _EAGER_EOT_THRESHOLD},
            ),
            llm=inference.LLM(model="openai/gpt-5.4-mini"),
            tts=inference.TTS(
                model="cartesia/sonic-3.6",
                voice=_CARTESIA_VOICE_ID,
                language="en",
            ),
            turn_handling=TurnHandlingOptions(turn_detection="stt"),
        ) as session:
            avatar = AvatarSession(
                avatar_id=AVATAR_ID,
                session_id=session_id.strip(),
                show_ai_label=SHOW_AI_LABEL,
            )
            await avatar.start(session, room=room)
            await session.start(room=room, agent=Assistant())
            session.input.set_audio_enabled(False)
            await avatar.wait_for_join(timeout=_AVATAR_JOIN_TIMEOUT_SECS)
            await avatar.wait_until_call_ready(timeout=_AVATAR_JOIN_TIMEOUT_SECS)
            session.input.set_audio_enabled(True)
            await session.generate_reply(
                instructions="Greet the caller in one or two sentences.",
            )

            done = asyncio.Event()

            @room.on("disconnected")
            def _on_disconnected(*_args: object) -> None:
                done.set()

            @room.on("participant_disconnected")
            def _on_participant_disconnected(
                _participant: rtc.RemoteParticipant,
            ) -> None:
                if not _visitor_still_in_room(room):
                    done.set()

            try:
                await asyncio.wait_for(done.wait(), timeout=_ROOM_EMPTY_TIMEOUT_SECS)
            except TimeoutError:
                logger.info("livekit example room timeout")
            finally:
                await avatar.aclose()
        await room.disconnect()
        logger.info("livekit example agent left")
