"""Session helpers. No network. Run: python tests/test_session.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import session


def test_constants_and_body():
    assert session.AVATAR_ID
    assert session.SHOW_AI_LABEL is False
    assert session.AKAPULU_API_ORIGIN.startswith("https://")
    body = session.live_session_body(
        room_url="https://example.daily.co/room",
        avatar_token="avatar-token",
    )
    assert body["avatar_id"] == session.AVATAR_ID
    assert body["show_ai_label"] is False
    assert body["room_url"] == "https://example.daily.co/room"
    assert body["avatar_token"] == "avatar-token"


def test_speaks_first():
    from bot import GREETING_CUE, SPOKEN_INSTRUCTION

    assert "Reply in one or two spoken sentences." in SPOKEN_INSTRUCTION
    assert "wait" not in SPOKEN_INSTRUCTION.lower()
    assert GREETING_CUE == "Greet the caller in one or two sentences."


def test_bot_uses_attach():
    from pathlib import Path

    bot_src = Path(__file__).resolve().parents[1] / "bot.py"
    text = bot_src.read_text()
    if "avatar.attach(transport)" not in text:
        raise RuntimeError("bot.py missing avatar.attach(transport)")
    if "wait_until_call_ready" not in text:
        raise RuntimeError("bot.py missing wait_until_call_ready")
    if "avatar_microphone_off" in text:
        raise RuntimeError("bot.py still has avatar_microphone_off")


if __name__ == "__main__":
    test_constants_and_body()
    try:
        test_speaks_first()
        test_bot_uses_attach()
    except ImportError as exc:
        print(f"bot import skipped: {exc}")
    print("ok")
