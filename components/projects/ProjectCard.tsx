"use client";

import type { ProjectSummary } from "@/modules/projects/types/project.types";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: ProjectSummary;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const timeAgo = getTimeAgo(new Date(project.updatedAt));

  return (
    <div
      onClick={() => router.push(`/studio/${project.id}`)}
      className="group relative glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-surface-700/40 hover:border-surface-600/60 hover:shadow-lg hover:shadow-brand-500/5 active:scale-[0.99]"
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface-600/60 text-text-tertiary hover:text-danger transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-brand-300 transition-colors">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-sm text-text-tertiary line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>
          {project.versionsCount}{" "}
          {project.versionsCount === 1 ? "version" : "versions"}
        </span>
        <span>Updated {timeAgo}</span>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
