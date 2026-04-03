import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `connectConversation`.
 *
 * Default `react-ui` demo (`/` or `/default`). `AkapuluProvider` POSTs here with no JSON body;
 * this handler sends an empty `runtime_vars` object by default. API key / base URL come from env.
 */

// Demo-only IDs — replace with your scenario and avatar from the dashboard.
const SCENARIO_ID = "<scenario id here>";
const AVATAR_ID = "d20e3ec3-b713-4e5e-aa5b-02f09031a339";

export async function POST() {
  const client = createAkapuluServerClient();

  return client
    .connectConversation({
      scenario_id: SCENARIO_ID,
      avatar_id: AVATAR_ID,
      runtime_vars: {},
      record_conversation: true,
    })
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
