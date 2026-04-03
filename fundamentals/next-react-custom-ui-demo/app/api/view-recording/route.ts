import { createAkapuluServerClient } from "@akapulu/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversation_id") ?? "";
  if (conversationId === "") {
    return Response.json({ error: "conversation_id is required." }, { status: 400 });
  }

  const client = createAkapuluServerClient();
  const recording = await client.getConversationRecording(conversationId);

  if (recording.kind === "redirect") {
    return Response.redirect(recording.location, recording.status);
  }

  if (recording.kind === "json") {
    return Response.json(recording.payload, { status: recording.status });
  }

  return new Response(recording.body, {
    status: recording.status,
    headers: {
      "Content-Type": recording.contentType,
      "Content-Disposition": recording.contentDisposition,
    },
  });
}
