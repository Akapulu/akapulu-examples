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
        <h1 style={{ margin: 0, fontSize: 32 }}>Akapulu React UI Demo</h1>
        <p style={{ margin: 0, color: "#334155", lineHeight: 1.55 }}>
          This app includes two routes so you can compare the prebuilt React UI with default behavior vs. a heavily
          customized setup.
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
              Baseline React UI example with backend-hardcoded connect settings.
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
              <Link href="/customized" style={{ color: "#0f172a", textDecoration: "none" }}>
                /customized
              </Link>
            </div>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.45 }}>
              React UI example with customization hooks, style overrides, and custom rendering behavior.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
