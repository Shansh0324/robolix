export interface ModelVersionSummary {
  id: string;
  generationId: string;
  projectId: string;
  version: number;
  filePath: string;
  format: string;
  fileSize?: number;
  triangleCount?: number;
  vertexCount?: number;
  createdAt: string;
}

export interface ModelMetadata {
  format: string;
  vertices: number;
  triangles: number;
  materials?: number;
  textures?: number;
  fileSize: number;
  generationModel: string;
  version: number;
}
