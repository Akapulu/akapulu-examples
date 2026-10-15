# akapulu-examples

A local server, a browser page, and a GPT Live bot (OpenAI Live) that uses [pipecat-akapulu](https://github.com/Akapulu/pipecat-akapulu). Maintained by Akapulu Labs.

The server creates a private Daily room for three participants: this page (`You`), the bot (`Assistant`), and the Akapulu worker (`Avatar`). It `POST`s `/api/live-sessions/` with the avatar token, then starts the bot. The page joins with the browser token. Audio out and video out stay off on the bot. The worker publishes the face and the played audio.

The bot is OpenAI Live (`gpt-live-1`, voice `marin`) with a Responses backend (`gpt-5.4-mini`). It listens only to the browser microphone.

Tested with Pipecat 1.12.0 and `pipecat-akapulu` 0.1.0.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `DAILY_API_KEY`, `AKAPULU_API_KEY`, `AKAPULU_AVATAR_ID`, `AKAPULU_SHOW_AI_LABEL` (`true` or `false`), and `OPENAI_API_KEY`. `AKAPULU_API_URL` is optional. Unset, the server and the bot use `https://akapulu.com`.

```bash
python server.py
```

Open http://127.0.0.1:7860 and choose Start call. The server handles one call at a time. A second start while a call is running returns an error.

`AKAPULU_API_KEY` stays in this process. The page receives the Daily room URL and the browser token.
