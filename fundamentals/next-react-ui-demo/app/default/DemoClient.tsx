"use client";

/**
 * Minimal `react-ui` demo: `AkapuluProvider` + default-styled `AkapuluConversation` only.
 *
 * Uses `/api/default/akapulu/*` API routes.
 */

import { AkapuluProvider } from "@akapulu/react";
import { AkapuluConversation } from "@akapulu/react-ui";

export default function DemoClient() {
  return (
    <AkapuluProvider
      config={{
        endpoints: {
          connectPath: "/api/default/akapulu/connect",
          updatesPath: "/api/default/akapulu/updates",
        },
      }}
    >
      <AkapuluConversation title="Akapulu next.js react-ui demo"/>
    </AkapuluProvider>
  );
}
