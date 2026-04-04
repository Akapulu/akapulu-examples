"use client";

import dynamic from "next/dynamic";

const DemoClient = dynamic(() => import("./DemoClient"), { ssr: false });

export default function StyledPage() {
  return (
    <main style={{ padding: 0, minHeight: "100dvh", background: "#000000" }}>
      <DemoClient />
    </main>
  );
}
