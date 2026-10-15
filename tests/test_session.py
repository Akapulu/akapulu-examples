"""Session helpers. No network. Run: python tests/test_session.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import session
from bot import GREETING_CUE, SPOKEN_INSTRUCTION, microphone_subscriptions


def test_api_origin():
    assert session.api_origin(None) == "https://akapulu.com"
    assert session.api_origin("https://akapulu-dev.fly.dev/") == "https://akapulu-dev.fly.dev"
    try:
        session.api_origin("ftp://example.com")
    except RuntimeError as exc:
        assert "AKAPULU_API_URL" in str(exc)
    else:
        raise AssertionError("ftp origin was accepted")


def test_show_ai_label_and_body():
    assert session.show_ai_label("true") is True
    assert session.show_ai_label("false") is False
    avatar = "11111111-1111-1111-1111-111111111111"
    body = session.live_session_body(
        avatar=avatar,
        label=False,
        room_url="https://example.daily.co/room",
        avatar_token="avatar-token",
    )
    assert body["avatar_id"] == avatar
    assert body["show_ai_label"] is False
    try:
        session.parse_avatar_id("clara")
    except RuntimeError as exc:
        assert "UUID" in str(exc)
    else:
        raise AssertionError("avatar id accepted a name")


def test_speaks_first():
    assert "Say one short sentence, then wait." in SPOKEN_INSTRUCTION
    assert GREETING_CUE == "Say one short sentence now, then wait."


def test_microphone_subscriptions():
    settings = microphone_subscriptions(
        {
            "local": {"info": {"isLocal": True, "userName": "Assistant"}},
            "browser": {"info": {"userName": "You"}},
            "avatar": {"info": {"userName": "Avatar"}},
        }
    )
    assert settings["browser"]["media"]["microphone"] == "subscribed"
    assert settings["avatar"]["media"]["microphone"] == "unsubscribed"
    assert "local" not in settings


if __name__ == "__main__":
    test_api_origin()
    test_show_ai_label_and_body()
    test_speaks_first()
    test_microphone_subscriptions()
    print("ok")
