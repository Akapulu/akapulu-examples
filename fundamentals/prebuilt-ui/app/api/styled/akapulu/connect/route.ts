import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `connectConversation`.
 *
 * Used by the styled prebuilt UI demo (`/styled` page). `AkapuluProvider` POSTs here via
 * `connectPath: /api/styled/akapulu/connect`.
 */

/* AKAPULU_CONNECT_PAYLOAD_START */
const connectPayload = {
  scenario_id: "<scenario id here>",
  avatar_id: "59488098-9e06-4dfa-9a90-03bd6c7fbddd",
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
