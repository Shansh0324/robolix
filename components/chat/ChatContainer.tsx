"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useGenerationStore } from "@/stores/generationStore";
import type { ChatMessageResponse } from "@/modules/chat/types/chat.types";

export function ChatContainer() {
  const { projectId } = useParams() as { projectId: string };
  const { messages, setMessages, addMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { status, progress, setGeneration } = useGenerationStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load or create conversation
  useEffect(() => {
    async function initChat() {
      try {
        // Find existing conversations for project
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        
        if (!data.success) return; // Handle err

        // Fetch conversations
        // Wait, the API to get conversations by project ID isn't directly exposed unless we add it,
        // Let's just create a new one if we don't have it saved locally, or we could fetch project convos.
        // For the MVP, we just create a new conversation per studio session or if none exists.
        
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
        setLoading(false);
      }
    }
    
    initChat();
  }, [projectId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || !conversationId) return;

    const content = input;
    const currentImage = imageFile;
    const currentPreview = imagePreview;
    
    setInput("");
    setImageFile(null);
    setImagePreview(null);

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

      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: content || "Here is a reference image.",
          imageUrl: uploadedUrl 
        }),
      });
      const data = await res.json();
      
      // Update with actual user message if needed
      
      // Start polling for new messages (specifically the AI's response)
      pollForMessages(conversationId);
      
    } catch (err) {
      console.error(err);
    }
  }

  // Very basic polling mechanism for the MVP
  // In a real app this would be SSE or WebSockets
  function pollForMessages(cId: string) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(interval); // Timeout after ~1 min
        return;
      }
      
      try {
        const res = await fetch(`/api/conversations/${cId}/messages`);
        const data = await res.json();
        if (data.success) {
          const fetchedMessages: ChatMessageResponse[] = data.data;
          
          // Check if AI responded (last message is ASSISTANT)
          const lastMsg = fetchedMessages[fetchedMessages.length - 1];
          if (lastMsg && lastMsg.role === "ASSISTANT") {
            setMessages(fetchedMessages);
            clearInterval(interval); // AI replied, stop polling
          }
        }
      } catch (e) {
        // ignore network errors while polling
      }
    }, 2000);
  }

  return (
    <div className="flex flex-col h-full w-[400px] border-r border-surface-700 bg-surface-900/50 backdrop-blur-xl shrink-0">
      {/* Header */}
      <div className="h-16 border-b border-surface-700 flex items-center px-6">
        <h2 className="font-semibold text-text-primary">AI Copilot</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "USER"
                  ? "bg-brand-500 text-white"
                  : "glass text-text-primary"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              
              {/* If User uploaded an image */}
              {(msg.metadata as any)?.imageUrl && (
                <div className="mt-3 overflow-hidden rounded-xl border border-surface-700/50">
                  <img src={(msg.metadata as any).imageUrl} alt="Reference" className="max-w-[200px] w-full object-cover" />
                </div>
              )}
              
              {/* If AI provided a model link */}
              {(msg.metadata as any)?.modelUrl && (
                <div className="mt-3 p-3 rounded-lg bg-surface-800 border border-brand-500/30">
                  <p className="text-xs text-brand-300 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
                    Model Generated
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
             <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-200" />
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
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black"
            >
              ×
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
              accept="image/*"
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }} 
            />
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            placeholder="Describe what you want to create..."
            className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-text-primary placeholder:text-text-tertiary px-3 py-2 max-h-32 min-h-[44px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() && !imageFile}
            className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white transition-all shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
