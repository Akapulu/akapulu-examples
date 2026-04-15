import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `connectConversation`.
 *
 * Default `react-ui` demo (`/default`). `AkapuluProvider` POSTs here with no JSON body.
 * API key / base URL come from env.
 */

/* AKAPULU_CONNECT_PAYLOAD_START */
const connectPayload = {
  scenario_id: "<scenario id here>",
  avatar_id: "f77de1e5-6ce3-448c-8cff-a8cc3c8a50bf",
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
