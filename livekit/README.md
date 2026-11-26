# LiveKit browser example

Local Akapulu Labs example on LiveKit: a small Python server, a browser page, and a LiveKit Agents voice bot with [livekit-akapulu](https://github.com/Akapulu/livekit-akapulu).

## How it works

One process (`server.py`) serves the page and starts the call on `127.0.0.1:7861`.

1. Open the page at `http://127.0.0.1:7861`.
2. Click **Start call**. The browser `POST`s `/session`.
3. The server calls `create_akapulu_livekit_call` (LiveKit room + tokens + `POST /api/live-sessions/`).
4. The server starts the voice bot in the background and returns the browser token.
5. The page joins LiveKit. The voice bot joins (Inference STT / LLM / TTS). The Akapulu Labs worker joins as `Avatar` and publishes the face and played audio.

`AvatarSession` runs inside the voice bot and sends assistant audio to the worker. STT stays muted until `wait_until_call_ready`.

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

Open http://127.0.0.1:7861 and choose **Start Call**.

## Layout

- `server.py`: local HTTP app (`GET /`, `POST /session`)
- `session.py`: `create_akapulu_livekit_call`
- `bot.py`: LiveKit Agents voice bot + `AvatarSession`
- `web/`: static page (`index.html`, `app.js`, `style.css`)
