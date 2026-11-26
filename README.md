# akapulu-examples

Local Akapulu Labs examples:

- **Pipecat / Daily** (this directory): `server.py` on `http://127.0.0.1:7860` with [pipecat-akapulu](https://github.com/Akapulu/pipecat-akapulu).
- **LiveKit** ([`livekit/`](livekit/)): `livekit/server.py` on `http://127.0.0.1:7861` with [livekit-akapulu](https://github.com/Akapulu/livekit-akapulu). Follow that folder’s README.

The rest of this page is the Pipecat / Daily example.

## Run the Pipecat / Daily example

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set:

- `DAILY_API_KEY`
- `AKAPULU_API_KEY`
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `CARTESIA_API_KEY`

The example uses Hollis, leaves **This is AI** off, and calls the Akapulu Labs production API.

```bash
python server.py
```

1. Open http://127.0.0.1:7860
2. Click **Start call**
3. Wait for the avatar (face + greeting). The worker needs a few seconds to load.

`AKAPULU_API_KEY` stays in the Python process. The page only receives the Daily room URL and the browser meeting token.

## How the call starts

One process (`server.py`) serves the page and starts the call.

1. The browser `POST`s `/session`.
2. The server creates a private Daily room, mints three meeting tokens, and `POST`s `/api/live-sessions/` (starts the Akapulu Labs worker).
3. The server starts the voice bot in the background and returns the browser token to the page.
4. The page joins Daily. The voice bot joins Daily (listens only; no camera or mic out). The Akapulu Labs worker joins and publishes the avatar video and audio.

`AkapuluAvatar` runs inside the voice bot and sends assistant audio to the worker. The bot calls `avatar.attach(transport)` and greets after `wait_until_call_ready`. The browser stays subscribed to the Avatar microphone. The transcript pane stays up; words stay out of it until the avatar is ready.

## Notes

### Avatar audio buffer

The avatar worker needs about **800 ms** of assistant audio before it starts rendering video. The render itself, given that audio, is around **150 ms**. So you can see added latency even when TTS time-to-first-audio is low: the worker is filling that buffer first.

A TTS that trickles audio in slowly fills the buffer late, so the response feels slower and the avatar gestures less. Prefer a TTS that sends audio in waves. Cartesia has been the best in our testing.

### Stack

- Deepgram Flux (`flux-general-multi`) hears the caller and takes the turn.
- OpenAI `gpt-5.4-mini` speaks, with reasoning off.
- Cartesia Sonic 3.6 speaks each finished sentence (Carson male voice `86e30c1d-714b-4074-a1f2-1cb6b552fb49`).
- The call starts in English. A later committed turn in another language switches Flux and Sonic.

Tested with Pipecat 1.14.0, 1.15.0, and 1.16.0 and `pipecat-akapulu` 0.1.22.

### Layout

- `server.py`: local HTTP app (`GET /`, `POST /session`)
- `session.py`: Daily room + tokens + Akapulu Labs live-session
- `bot.py`: Pipecat voice bot (Deepgram Flux, OpenAI, Cartesia Sonic, `AkapuluAvatar`)
- `web/`: static page (`index.html`, `app.js`, `style.css`)
