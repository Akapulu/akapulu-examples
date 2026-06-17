import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `connectConversation`.
 *
 * The React app’s `AkapuluProvider` POSTs here (see `connectPath`).
 */

/* AKAPULU_CONNECT_PAYLOAD_START */
const connectPayload = {
  scenario_id: "<scenario id here>",
  avatar_id: "1285bfe4-3512-4b34-93ad-196098597a1c",
  runtime_vars: {},
  record_conversation: true,
};
/* AKAPULU_CONNECT_PAYLOAD_END */

export async function POST() {
  const client = createAkapuluServerClient();

  return client
    .connectConversation(connectPayload)
    .then((payload) => Response.json(payload))
    .catch((error: unknown) => {
      if (error instanceof AkapuluApiError) {
        return Response.json(error.details ?? { error: error.message }, { status: error.status });
      }

      return Response.json(
        { error: "Unexpected server error while connecting conversation." },
        { status: 500 }
      );
    });
}
