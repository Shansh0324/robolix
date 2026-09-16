"use client";

import { useProjectStore } from "@/stores/projectStore";
import { useEffect } from "react";
import { Providers } from "@/app/providers";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="h-screen w-full flex overflow-hidden bg-surface-950">
        {children}
      </div>
    </Providers>
  );
}
