"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import type { ChatMessageResponse } from "@/modules/chat/types/chat.types";

export function ChatContainer() {
  const { projectId } = useParams() as { projectId: string };
  const { messages, setMessages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load or create conversation
  useEffect(() => {
    async function initChat() {
      try {
        const createRes = await fetch(`/api/projects/${projectId}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });

        if (createRes.ok) {
          const cData = await createRes.json();
          setConversationId(cData.data.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitializing(false);
      }
    }

    initChat();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [projectId]);

  // Polling: Fetch messages every 1.5s while generation is in progress
  const startPolling = useCallback(
    (cId: string) => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      let attempts = 0;
      pollingRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 120) {
          // 3 minute timeout
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        try {
          const res = await fetch(`/api/conversations/${cId}/messages`);
          const data = await res.json();
          if (data.success) {
            const fetched: ChatMessageResponse[] = data.data;
            setMessages(fetched);

            // Stop polling once we get a MODEL or ERROR message from assistant
            const lastAssistant = [...fetched].reverse().find((m) => m.role === "ASSISTANT");
            if (lastAssistant) {
              const meta = lastAssistant.metadata as any;
              if (meta?.type === "MODEL" || meta?.type === "ERROR") {
                setSending(false);
                if (pollingRef.current) clearInterval(pollingRef.current);
              }
            }
          }
        } catch {
          // ignore network errors while polling
        }
      }, 1500);
    },
    [setMessages]
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || !conversationId || sending) return;

    const content = input;
    const currentImage = imageFile;
    const currentPreview = imagePreview;

    setInput("");
    setImageFile(null);
    setImagePreview(null);
    setSending(true);

    // Optimistically add user message
    const tempId = Date.now().toString();
    addMessage({
      id: tempId,
      conversationId,
      role: "USER",
      content,
      metadata: currentPreview ? { imageUrl: currentPreview } : undefined,
      createdAt: new Date().toISOString(),
      attachments: [],
    });

    try {
      // Upload image if present
      let uploadedUrl = null;
      if (currentImage) {
        const formData = new FormData();
        formData.append("file", currentImage);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedUrl = uploadData.data.url;
        }
      }

      // Send the message
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content || "Generate a 3D model from this reference image.",
          imageUrl: uploadedUrl,
        }),
      });

      // Start polling for status updates from the orchestrator
      startPolling(conversationId);
    } catch (err) {
      console.error(err);
      setSending(false);
    }
  }

  // Determine if a message is a status update
  function isStatusMessage(msg: ChatMessageResponse) {
    const meta = msg.metadata as any;
    return meta?.type === "STATUS";
  }

  function isErrorMessage(msg: ChatMessageResponse) {
    const meta = msg.metadata as any;
    return meta?.type === "ERROR";
  }

  function isModelMessage(msg: ChatMessageResponse) {
    const meta = msg.metadata as any;
    return meta?.type === "MODEL";
  }

  function renderMessage(msg: ChatMessageResponse) {
    const meta = msg.metadata as any;

    if (msg.role === "USER") {
      return (
        <div key={msg.id} className="flex justify-end animate-fade-in">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-brand-500 text-white">
            <p className="text-sm leading-relaxed">{msg.content}</p>
            {meta?.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/20">
                <img
                  src={meta.imageUrl}
                  alt="Reference"
                  className="max-w-[200px] w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // STATUS messages — show as pipeline step indicators
    if (isStatusMessage(msg)) {
      return (
        <div key={msg.id} className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] flex items-start gap-3 px-4 py-2">
            <div className="w-2 h-2 mt-2 rounded-full bg-brand-400 animate-pulse shrink-0" />
            <p className="text-sm text-text-secondary leading-relaxed">{msg.content}</p>
          </div>
        </div>
      );
    }

    // ERROR messages
    if (isErrorMessage(msg)) {
      return (
        <div key={msg.id} className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-300">
            <p className="text-sm leading-relaxed">{msg.content}</p>
          </div>
        </div>
      );
    }

    // MODEL messages — final result
    if (isModelMessage(msg)) {
      return (
        <div key={msg.id} className="flex justify-start animate-fade-in">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 glass text-text-primary">
            <p className="text-sm leading-relaxed">{msg.content}</p>
            <div className="mt-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/30">
              <p className="text-xs text-brand-300 font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse-soft" />
                3D Model Ready — Viewing in canvas
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Generic assistant messages
    return (
      <div key={msg.id} className="flex justify-start animate-fade-in">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 glass text-text-primary">
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[400px] border-l border-surface-700 bg-surface-900/50 backdrop-blur-xl shrink-0">
      {/* Header */}
      <div className="h-16 border-b border-surface-700 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-text-primary text-sm">AI Copilot</h2>
            <p className="text-xs text-text-tertiary">
              {sending ? "Processing..." : "Ready"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && !initializing && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 glass text-text-primary">
              <p className="text-sm leading-relaxed">
                👋 Welcome! Describe what you want to create, or upload a reference image and I'll generate a 3D model for you.
              </p>
            </div>
          </div>
        )}

        {messages.map(renderMessage)}

        {/* Typing indicator while waiting for first status */}
        {sending && !messages.some((m) => m.role === "ASSISTANT") && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
              <span
                className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface-900 border-t border-surface-700 flex flex-col gap-3">
        {imagePreview && (
          <div className="relative w-24 h-24 rounded-xl border border-surface-700 overflow-hidden bg-surface-800">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black text-xs"
            >
              ✕
            </button>
          </div>
        )}
        <form
          onSubmit={handleSend}
          className="relative flex items-end gap-2 bg-surface-800 rounded-2xl border border-surface-700 focus-within:border-brand-500/50 transition-colors p-2"
        >
          <label className="p-2 text-text-tertiary hover:text-text-primary cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 10 * 1024 * 1024) {
                    alert("Image must be under 10MB");
                    return;
                  }
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={sending ? "Generating..." : "Describe what you want to create..."}
            disabled={sending}
            className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-text-primary placeholder:text-text-tertiary px-3 py-2 max-h-32 min-h-[44px] disabled:opacity-50"
            rows={1}
          />
          <button
            type="submit"
            disabled={(!input.trim() && !imageFile) || sending}
            className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white transition-all shrink-0"
          >
            {sending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
