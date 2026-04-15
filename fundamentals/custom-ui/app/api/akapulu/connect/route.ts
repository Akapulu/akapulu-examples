import { AkapuluApiError, createAkapuluServerClient } from "@akapulu/server";

/**
 * Browser → this route → Akapulu `connectConversation`.
 *
 * The React app’s `AkapuluProvider` POSTs here (see `connectPath`). This route sends an empty
 * `runtime_vars` object by default.
 */

// Demo-only IDs — replace with your scenario and avatar from the dashboard.
const SCENARIO_ID = "<scenario id here>";
const AVATAR_ID = "f77de1e5-6ce3-448c-8cff-a8cc3c8a50bf";

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
