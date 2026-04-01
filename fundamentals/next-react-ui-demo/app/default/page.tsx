"use client";

import dynamic from "next/dynamic";

const DemoClient = dynamic(() => import("./DemoClient"), { ssr: false });

export default function Home() {
  return (
    <main >
      <DemoClient />
    </main>
  );
}
