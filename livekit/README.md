# LiveKit browser example

Local Akapulu Labs example on LiveKit: a small Python server, a browser page, and a LiveKit Agents voice bot with [livekit-akapulu](https://github.com/Akapulu/livekit-akapulu).

## Run

```bash
cd livekit
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set:

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (LiveKit Cloud project with Inference enabled)
- `AKAPULU_API_KEY`

The example uses Hollis, leaves **This is AI** off, and calls the Akapulu Labs production API.

```bash
python server.py
```

1. Open http://127.0.0.1:7861
2. Click **Start Call**
3. Wait for the avatar (face + greeting). The worker needs a few seconds to load.

## How the call starts

One process (`server.py`) serves the page and starts the call on `127.0.0.1:7861`.

1. The browser `POST`s `/session`.
2. The server calls `create_akapulu_livekit_call` (LiveKit room + tokens + `POST /api/live-sessions/`).
3. The server starts the voice bot in the background and returns the browser token.
4. The page joins LiveKit. The voice bot joins (Inference STT / LLM / TTS). The Akapulu Labs worker joins as `Avatar` and publishes the face and played audio.

`AvatarSession` runs inside the voice bot and sends assistant audio to the worker. STT stays muted until `wait_until_call_ready`.

## Notes

### Avatar audio buffer

The avatar worker needs about **800 ms** of assistant audio before it starts rendering video. The render itself, given that audio, is around **150 ms**. So you can see added latency even when TTS time-to-first-audio is low: the worker is filling that buffer first.

A TTS that trickles audio in slowly fills the buffer late, so the response feels slower and the avatar gestures less. Prefer a TTS that sends audio in waves. Cartesia has been the best in our testing.

## Layout

- `server.py`: local HTTP app (`GET /`, `POST /session`)
- `session.py`: `create_akapulu_livekit_call`
- `bot.py`: LiveKit Agents voice bot + `AvatarSession`
- `web/`: static page (`index.html`, `app.js`, `style.css`)
