"use client";

import { useState, type FormEvent } from "react";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  loading?: boolean;
}

export function CreateProjectDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ name, description: description || undefined });
    setName("");
    setDescription("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md glass-strong rounded-2xl p-8 animate-slide-up">
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          New Project
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Create a new 3D generation project
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="project-name"
              className="text-sm font-medium text-text-secondary"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              placeholder="e.g., Gaming Chair Design"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-description"
              className="text-sm font-medium text-text-secondary"
            >
              Description{" "}
              <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all resize-none"
              placeholder="Describe the project..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-surface-700/50 hover:bg-surface-700 text-text-secondary font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
