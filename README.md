# akapulu-examples

Local Akapulu Labs example: a small Python server, a browser page, and a GPT Live voice bot with [pipecat-akapulu](https://github.com/Akapulu/pipecat-akapulu).

## How it works

One process (`server.py`) serves the page and starts the call.

1. Open the page at `http://127.0.0.1:7860`.
2. Click **Start call**. The browser `POST`s `/session`.
3. The server creates a private Daily room, mints three meeting tokens, and `POST`s `/api/live-sessions/` (starts the Akapulu Labs worker).
4. The server starts the voice bot in the background and returns the browser token to the page.
5. The page joins Daily. The voice bot joins Daily (listens only; no camera or mic out). The Akapulu Labs worker joins and publishes the face and the played audio.

`AkapuluAvatar` runs inside the voice bot and sends assistant audio to the worker.

The bot is OpenAI Live (`gpt-live-1`, voice `marin`) with a Responses backend (`gpt-5.4-mini`). It listens only to the browser microphone. When the browser joins, the bot speaks first: one short sentence, then it waits.

Tested with Pipecat 1.14.0 and `pipecat-akapulu` 0.1.6.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set:

- `DAILY_API_KEY`
- `AKAPULU_API_KEY`
- `OPENAI_API_KEY`

The example uses Clara, leaves **This is AI** off, and calls the Akapulu Labs production API.

```bash
python server.py
```

Open http://127.0.0.1:7860 and choose **Start call**. The server handles one call at a time. A second start while a call is running returns an error.

`AKAPULU_API_KEY` stays in the Python process. The page only receives the Daily room URL and the browser meeting token.

## Layout

- `server.py` — local HTTP app (`GET /`, `POST /session`)
- `session.py` — Daily room + tokens + Akapulu Labs live-session
- `bot.py` — Pipecat voice bot (OpenAI Live + `AkapuluAvatar`)
- `web/` — static page (`index.html`, `app.js`, `style.css`)
