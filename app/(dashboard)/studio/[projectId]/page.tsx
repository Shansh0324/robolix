"use client";

import { ChatContainer } from "@/components/chat/ChatContainer";
import { ModelViewer } from "@/components/viewer/ModelViewer";
import Link from "next/link";

export default function StudioPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar / Back Navigation */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto">
        <Link 
          href="/projects"
          className="glass hover:bg-surface-700/60 transition-colors w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
      </div>

      {/* Main 3D Viewer Area */}
      <ModelViewer />

      {/* Chat Copilot Area */}
      <ChatContainer />
    </div>
  );
}
