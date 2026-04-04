import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 820,
          display: "grid",
          gap: "1rem",
          color: "#0f172a",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32 }}>Pre-built UI demo</h1>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.55 }}>
          Two routes: <strong>Default</strong> (baseline <code>AkapuluConversation</code>) and <strong>Styled</strong>{" "}
          (same component with style overrides and custom rendering).
        </p>

        <div
          style={{
            marginTop: 8,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              padding: "0.9rem 1rem",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              <Link href="/default" style={{ color: "#0f172a", textDecoration: "none" }}>
                /default
              </Link>
            </div>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.45 }}>
              Default variant: baseline <code>AkapuluConversation</code> and connect routes under <code>/api/default</code>.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              padding: "0.9rem 1rem",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              <Link href="/styled" style={{ color: "#0f172a", textDecoration: "none" }}>
                /styled
              </Link>
            </div>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.45 }}>
              Styled variant: dark theme, slot styles, custom transcript rows and tool toast, console event logging.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
