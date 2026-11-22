"""Create a LiveKit room and an Akapulu live session.

Uses ``create_akapulu_livekit_call`` from livekit-akapulu. The browser token
joins as You. The voice agent joins as agent. Avatar, This is AI, and the
Akapulu Labs API origin are fixed for this example.

Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and AKAPULU_API_KEY.
"""

from __future__ import annotations

import aiohttp
from livekit_akapulu import create_akapulu_livekit_call

# Hollis (public catalog). This is AI off.
AVATAR_ID = "1285bfe4-3512-4b34-93ad-196098597a1c"
SHOW_AI_LABEL = False
AGENT_IDENTITY = "agent"


async def create_call(
    http: aiohttp.ClientSession,
) -> tuple[str, str, str, str, str]:
    """Return livekit_url, room_name, agent_token, browser_token, session_id."""
    return await create_akapulu_livekit_call(
        avatar_id=AVATAR_ID,
        show_ai_label=SHOW_AI_LABEL,
        session=http,
        agent_identity=AGENT_IDENTITY,
    )
