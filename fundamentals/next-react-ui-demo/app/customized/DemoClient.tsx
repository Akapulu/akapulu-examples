"use client";

/**
 * Customized `AkapuluConversation` demo: dark theme, custom transcript labels, custom tool toast,
 * and a sibling component that logs all session events via `useAkapuluEvents`.
 *
 * API routes live under `/api/customized/akapulu/*` so this page stays separate from the default demo.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { AkapuluProvider, useAkapuluEvents, useAkapuluSession } from "@akapulu/react";
import { AkapuluConversation } from "@akapulu/react-ui";

import { darkStyles, renderDarkToolEvent } from "./customization";

// =============================================================================
// Logs every `AkapuluEvent` — useful to see the full event contract while using prebuilt UI
// =============================================================================

function ConversationEventLogger() {
  useAkapuluEvents((event) => {
    if (event.type === "status_changed") {
      console.log("[customized-demo][status_changed]", { status: event.status });
      return;
    }

    if (event.type === "bot_speaking_state_changed") {
      console.log("[customized-demo][bot_speaking_state_changed]", { speakingState: event.speakingState });
      return;
    }

    if (event.type === "node_changed") {
      console.log("[customized-demo][node_changed]", { node: event.node });
      return;
    }

    if (event.type === "tool_event") {
      console.log("[customized-demo][tool_event]", {
        messageType: event.tool.messageType,
        functionName: event.tool.functionName,
        summary: event.tool.summary,
        query: event.tool.query,
        argsJson: event.tool.argsJson,
        body: event.tool.body,
        rawMessage: event.tool.rawMessage,
      });
      return;
    }

    if (event.type === "transcript_updated") {
      console.log("[customized-demo][transcript_updated]", {
        id: event.transcript.id,
        speaker: event.transcript.speaker,
        text: event.transcript.text,
        isFinal: event.transcript.isFinal,
        timestamp: event.transcript.timestamp,
      });
      return;
    }

    if (event.type === "call_ready") {
      console.log("[customized-demo][call_ready]");
      return;
    }

    if (event.type === "timeout") {
      console.log("[customized-demo][timeout]", { reason: event.reason });
    }
  });

  return null;
}

function ConversationEndedRedirect() {
  const router = useRouter();
  const { status, conversationSessionId } = useAkapuluSession();
  const lastConversationIdRef = useRef<string | null>(null);
  const redirectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationSessionId) return;
    lastConversationIdRef.current = conversationSessionId;
  }, [conversationSessionId]);

  useEffect(() => {
    if (status !== "ended") return;
    if (!lastConversationIdRef.current) return;
    if (redirectedConversationIdRef.current === lastConversationIdRef.current) return;

    redirectedConversationIdRef.current = lastConversationIdRef.current;
    router.push(`/view-conversation-details/${encodeURIComponent(lastConversationIdRef.current)}`);
  }, [router, status]);

  return null;
}

// =============================================================================
// Root: provider + prebuilt conversation + customization module
// =============================================================================

export default function DemoClient() {
  return (
    <AkapuluProvider
      config={{
        endpoints: {
          connectPath: "/api/customized/akapulu/connect",
          updatesPath: "/api/customized/akapulu/updates",
        },
        connectBody: {
          runtime_vars: {},
        },
      }}
    >
      <ConversationEndedRedirect />
      <ConversationEventLogger />

      <AkapuluConversation
        title="Akapulu next.js react-ui customized demo"
        styles={darkStyles}
        toolEventTimeoutMs={4000}
        renderToolEvent={(tool) => renderDarkToolEvent(tool, true)}
        renderTranscriptEntry={(entry) => (
          <div>
            <strong>{entry.speaker === "user" ? "User" : "Assistant"}:</strong> {entry.text}
          </div>
        )}
      />
    </AkapuluProvider>
  );
}
