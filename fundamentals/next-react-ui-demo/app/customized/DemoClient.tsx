"use client";

/**
 * Customized `AkapuluConversation` demo: dark theme, custom transcript labels, custom tool toast,
 * and a sibling component that logs all session events via `useAkapuluEvents`.
 *
 * API routes live under `/api/customized/akapulu/*` so this page stays separate from the default demo.
 */

import { useEffect, useRef, useState } from "react";

import { AkapuluProvider, useAkapuluEvents } from "@akapulu/react";
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

// =============================================================================
// Root: provider + prebuilt conversation + customization module
// =============================================================================

export default function DemoClient() {
  const [isToolToastVisible, setIsToolToastVisible] = useState(false);
  const toolToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (!toolToastTimeoutRef.current) return;
      clearTimeout(toolToastTimeoutRef.current);
      toolToastTimeoutRef.current = null;
    };
  }, []);

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
      <ConversationEventLogger />

      <AkapuluConversation
        title="Akapulu next.js react-ui customized demo"
        styles={darkStyles}
        onToolEvent={(tool) => {
          console.log("customized-demo tool_event", tool.messageType, tool.functionName);
          setIsToolToastVisible(true);
          if (toolToastTimeoutRef.current) {
            clearTimeout(toolToastTimeoutRef.current);
          }
          toolToastTimeoutRef.current = setTimeout(() => {
            setIsToolToastVisible(false);
            toolToastTimeoutRef.current = null;
          }, 4000);
        }}
        renderToolEvent={(tool) => renderDarkToolEvent(tool, isToolToastVisible)}
        renderTranscriptEntry={(entry) => (
          <div>
            <strong>{entry.speaker === "user" ? "User" : "Assistant"}:</strong> {entry.text}
          </div>
        )}
      />
    </AkapuluProvider>
  );
}
