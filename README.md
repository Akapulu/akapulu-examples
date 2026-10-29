# akapulu-examples

Local Akapulu Labs example: a small Python server, a browser page, and a voice bot with [pipecat-akapulu](https://github.com/Akapulu/pipecat-akapulu).

## How it works

One process (`server.py`) serves the page and starts the call.

1. Open the page at `http://127.0.0.1:7860`.
2. Click **Start call**. The browser `POST`s `/session`.
3. The server creates a private Daily room, mints three meeting tokens, and `POST`s `/api/live-sessions/` (starts the Akapulu Labs worker).
4. The server starts the voice bot in the background and returns the browser token to the page.
5. The page joins Daily. The voice bot joins Daily (listens only; no camera or mic out). The Akapulu Labs worker joins and publishes the face and the played audio.

`AkapuluAvatar` runs inside the voice bot and sends assistant audio to the worker.

The worker starts the face only after a short stretch of assistant audio has arrived. Speech-to-speech models often reach that first audio quickly, then trickle, so the buffer fills slowly. A streaming TTS keeps the audio coming after the first chunk, which fills the buffer sooner. Cartesia has been the best mix we have tried: a low time to first audio, and audio that keeps arriving quickly enough to fill that buffer.

Deepgram Flux (`flux-general-multi`) hears the caller and takes the turn. OpenAI `gpt-5.4-mini` speaks, with reasoning off. Cartesia Sonic 3.6 speaks each finished sentence, with the buffer delay at 0, using the Ariana voice `ec1e269e-9ca0-402f-8a18-58e0e022355a`. The call starts in English. A later committed turn in another language switches Flux and Sonic. When the participant named Avatar joins, the bot turns that microphone off. The browser stays subscribed to it. When the browser joins, the bot speaks first in one or two sentences. The transcript pane stays up, and the words stay out of it until the avatar is ready.

Tested with Pipecat 1.14.0 and `pipecat-akapulu` 0.1.12.

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
- `DEEPGRAM_API_KEY`
- `CARTESIA_API_KEY`

The example uses Clara, leaves **This is AI** off, and calls the Akapulu Labs production API.

```bash
python server.py
```

Open http://127.0.0.1:7860 and choose **Start call**. The server handles one call at a time. A second start while a call is running returns an error.

`AKAPULU_API_KEY` stays in the Python process. The page only receives the Daily room URL and the browser meeting token.

## Layout

- `server.py`: local HTTP app (`GET /`, `POST /session`)
- `session.py`: Daily room + tokens + Akapulu Labs live-session
- `bot.py`: Pipecat voice bot (Deepgram Flux, OpenAI, Cartesia Sonic, `AkapuluAvatar`)
- `web/`: static page (`index.html`, `app.js`, `style.css`)
