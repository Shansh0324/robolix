export interface ProjectSummary {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  versionsCount: number;
  createdAt: string;
  updatedAt: string;
}
