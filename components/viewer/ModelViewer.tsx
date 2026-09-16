"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Grid } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import { useChatStore } from "@/stores/chatStore";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ModelViewer() {
  const { messages } = useChatStore();
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  // Find the latest model URL from messages
  useEffect(() => {
    // Traverse backwards to find the last message with a modelUrl
    for (let i = messages.length - 1; i >= 0; i--) {
      const metadata = messages[i].metadata as any;
      if (metadata?.modelUrl) {
        setModelUrl(metadata.modelUrl as string);
        break;
      }
    }
  }, [messages]);

  return (
    <div className="flex-1 relative bg-surface-950">
      {/* Top Bar for viewer controls */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="glass px-4 py-2 rounded-xl pointer-events-auto">
          <h3 className="text-sm font-medium text-text-primary">Interactive Preview</h3>
          <p className="text-xs text-text-tertiary">Orbit to rotate • Scroll to zoom</p>
        </div>

        {modelUrl && (
          <a
            href={modelUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="glass hover:bg-surface-700/60 transition-colors px-4 py-2 rounded-xl text-sm font-medium text-brand-300 flex items-center gap-2 pointer-events-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download GLB
          </a>
        )}
      </div>

      {!modelUrl ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <p className="text-text-secondary text-lg">No model generated yet</p>
            <p className="text-text-tertiary text-sm mt-1">Describe what you want in the chat</p>
          </div>
        </div>
      ) : (
        <Canvas shadows camera={{ position: [4, 2, 4], fov: 45 }}>
          <color attach="background" args={["#0c0b10"]} />
          
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
              <Model url={modelUrl} />
            </Stage>
          </Suspense>

          <OrbitControls 
            makeDefault 
            autoRotate 
            autoRotateSpeed={0.5}
            minDistance={2}
            maxDistance={10}
          />
          
          <Grid
            infiniteGrid
            fadeDistance={20}
            sectionColor="#333"
            cellColor="#222"
            position={[0, -0.01, 0]}
          />
        </Canvas>
      )}
    </div>
  );
}
