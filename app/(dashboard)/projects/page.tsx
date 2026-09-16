"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import type { ProjectSummary } from "@/modules/projects/types/project.types";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      } else if (data.error?.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleCreate(data: { name: string; description?: string }) {
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setProjects((prev) => [result.data, ...prev]);
        setDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-strong border-b border-surface-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">AI 3D Studio</h1>
          <button
            onClick={() => {
              // Clear auth cookie and redirect
              document.cookie =
                "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
              router.push("/login");
            }}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Projects</h2>
            <p className="text-text-secondary mt-1">
              Your 3D generation projects
            </p>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all duration-300 active:scale-[0.98]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Project
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 space-y-4"
              >
                <div className="w-12 h-12 rounded-xl animate-shimmer" />
                <div className="h-5 w-3/4 rounded-lg animate-shimmer" />
                <div className="h-4 w-1/2 rounded-lg animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-surface-800/60 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-text-tertiary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No projects yet
            </h3>
            <p className="text-text-tertiary text-center max-w-sm mb-6">
              Create your first project to start generating 3D models with AI.
            </p>
            <button
              onClick={() => setDialogOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold transition-all duration-300"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Project Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
    </div>
  );
}
