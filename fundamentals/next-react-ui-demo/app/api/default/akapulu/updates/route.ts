import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `pollConversationUpdates`.
 *
 * Default `react-ui` demo. While `connecting`, the client polls with `conversation_session_id`
 * from the connect response so the prebuilt UI can show readiness progress.
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationSessionId = url.searchParams.get("conversation_session_id") ?? "";

  if (conversationSessionId === "") {
    return Response.json({ error: "conversation_session_id is required." }, { status: 400 });
  }

  const client = createAkapuluServerClient();

  return client
    .pollConversationUpdates(conversationSessionId)
    .then((payload) => Response.json(payload))
    .catch((error: unknown) => {
      if (error instanceof AkapuluApiError) {
        return Response.json(error.details ?? { error: error.message }, { status: error.status });
      }

      return Response.json(
        { error: "Unexpected server error while fetching conversation updates." },
        { status: 500 }
      );
    });
}
