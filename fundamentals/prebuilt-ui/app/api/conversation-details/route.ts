import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversation_id") ?? "";
  if (conversationId === "") {
    return Response.json({ error: "conversation_id is required." }, { status: 400 });
  }

  const client = createAkapuluServerClient();

  return client
    .getConversationDetail(conversationId)
    .then((payload) => {
      if (Array.isArray(payload.transcript_rows)) {
        payload.transcript_rows = payload.transcript_rows.map((row) => {
          const nextRow = { ...row };
          if (nextRow.content !== undefined && nextRow.content !== null && typeof nextRow.content !== "string") {
            nextRow.content = JSON.stringify(nextRow.content, null, 2);
          }
          return nextRow;
        });
      }
      return Response.json(payload);
    })
    .catch((error: unknown) => {
      if (error instanceof AkapuluApiError) {
        return Response.json(error.details ?? { error: error.message }, { status: error.status });
      }

      return Response.json({ error: "Unexpected server error while loading conversation details." }, { status: 500 });
    });
}
