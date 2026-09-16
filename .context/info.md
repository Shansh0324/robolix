# AI 3D Studio

> A conversational AI-powered 3D generation platform where users can describe a 3D object through chat, upload reference images, generate 3D models, iterate through natural-language instructions, preview the result in Three.js, and download the generated model.

---

# 1. Project Vision

Build a modern AI 3D Studio similar in concept to conversational 3D generation platforms.

The user interacts with the application primarily through a **chat interface**.

The user can:

* Describe a 3D object using natural language.
* Upload one or more reference images.
* Combine text + images.
* Generate a 3D model.
* Ask the AI to regenerate the model.
* Ask the AI to change colors/materials/style.
* View generated models in an interactive 3D viewer.
* Switch between model versions.
* Download generated `.glb` / `.gltf` files.
* See generation progress in real time.

The first version is a **testing/MVP version**.

Do NOT over-engineer the MVP.

---

# 2. Core Architecture

Use:

* Next.js
* TypeScript
* React
* Tailwind CSS
* React Three Fiber
* Three.js
* Zustand
* TanStack Query
* Zod
* Prisma
* PostgreSQL
* Redis
* Python
* FastAPI
* Gemini API
* Mistral API
* Hugging Face 3D models

Do NOT use:

* NestJS
* Separate Node.js backend
* Cloudflare R2
* AWS S3
* Blender
* Separate file-storage service
* Separate processing service

These can be added later when required.

---

# 3. High-Level Architecture

```text
                         USER
                          │
                          ▼
                 ┌──────────────────┐
                 │     Next.js      │
                 │                  │
                 │ UI + API Routes  │
                 │ DTOs             │
                 │ Services         │
                 │ Repositories     │
                 │ Prisma           │
                 │ Redis            │
                 └────────┬─────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      ┌─────────────────┐     ┌─────────────────┐
      │   AI SERVICE    │     │  MODEL SERVICE  │
      │                 │     │                 │
      │ Python/FastAPI  │     │ Python/FastAPI  │
      │                 │     │                 │
      │ Gemini          │     │ TRELLIS         │
      │ Mistral         │     │ Hunyuan3D       │
      │ Intent Router   │     │ TripoSR         │
      └────────┬────────┘     └────────┬────────┘
               │                       │
               └───────────┬───────────┘
                           │
                           ▼
                      GLB / GLTF
                           │
                           ▼
                 ┌──────────────────┐
                 │ React Three Fiber│
                 │     Viewer       │
                 └──────────────────┘
```

---

# 4. Request Flow

## Image + Prompt

```text
User
 │
 │ Image + "Make this futuristic"
 ▼
Next.js
 │
 ▼
API Route
 │
 ▼
AI Service
 │
 ├── Gemini/Mistral
 │
 ▼
Structured GenerationInstruction
 │
 ▼
Model Service
 │
 ├── TRELLIS / Hunyuan3D / TripoSR
 │
 ▼
GLB
 │
 ▼
Next.js
 │
 ▼
Three.js Viewer
```

---

# 5. Text-Only Generation

The 3D models used in the MVP may primarily support image-to-3D rather than direct text-to-3D.

Therefore text-only requests should use:

```text
User Prompt
     │
     ▼
AI Service
     │
     ▼
Detailed visual description
     │
     ▼
Text-to-Image Model
     │
     ▼
Reference Image
     │
     ▼
3D Model Service
     │
     ▼
GLB
```

The text-to-image provider must be implemented behind an abstraction so it can be replaced later.

---

# 6. Multimodal Chat

The chat must support:

### Text

```text
Create a futuristic gaming chair.
```

### Image

```text
[uploaded-image.jpg]
```

### Text + Image

```text
[uploaded-image.jpg]

Turn this into a futuristic gaming chair.
Keep the overall silhouette.
```

### Multiple Images

```text
front.jpg
side.jpg
back.jpg

Create a 3D model based on these references.
```

---

# 7. Repository Structure

Use the following structure:

```text
ai-3d-studio/
│
├── app/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   │
│   │   └── studio/
│   │       └── [projectId]/
│   │           ├── page.tsx
│   │           └── loading.tsx
│   │
│   ├── api/
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [projectId]/
│   │   │       └── route.ts
│   │   │
│   │   ├── conversations/
│   │   │   └── [conversationId]/
│   │   │       ├── route.ts
│   │   │       └── messages/
│   │   │           └── route.ts
│   │   │
│   │   ├── generations/
│   │   │   ├── route.ts
│   │   │   └── [generationId]/
│   │   │       ├── route.ts
│   │   │       ├── cancel/
│   │   │       │   └── route.ts
│   │   │       └── retry/
│   │   │           └── route.ts
│   │   │
│   │   ├── models/
│   │   │   ├── route.ts
│   │   │   └── [modelId]/
│   │   │       └── route.ts
│   │   │
│   │   └── health/
│   │       └── route.ts
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
│
├── components/
│   │
│   ├── chat/
│   │   ├── ChatContainer.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── ChatInput.tsx
│   │   ├── AttachmentPreview.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── GenerationProgress.tsx
│   │   └── TypingIndicator.tsx
│   │
│   ├── viewer/
│   │   ├── ModelViewer.tsx
│   │   ├── ViewerControls.tsx
│   │   ├── CameraControls.tsx
│   │   ├── EnvironmentControls.tsx
│   │   ├── ModelStats.tsx
│   │   ├── LoadingModel.tsx
│   │   └── ModelError.tsx
│   │
│   ├── generation/
│   │   ├── GenerationStatus.tsx
│   │   ├── GenerationCard.tsx
│   │   ├── GenerationHistory.tsx
│   │   └── GenerationActions.tsx
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── CreateProjectDialog.tsx
│   │   └── ProjectHeader.tsx
│   │
│   ├── versions/
│   │   ├── VersionList.tsx
│   │   ├── VersionCard.tsx
│   │   └── VersionSelector.tsx
│   │
│   └── ui/
│       └── ...
│
├── modules/
│   │
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── LoginDto.ts
│   │   │   └── RegisterDto.ts
│   │   ├── services/
│   │   │   └── AuthService.ts
│   │   ├── repositories/
│   │   │   └── AuthRepository.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   ├── projects/
│   │   ├── dto/
│   │   │   ├── CreateProjectDto.ts
│   │   │   └── UpdateProjectDto.ts
│   │   ├── services/
│   │   │   └── ProjectService.ts
│   │   ├── repositories/
│   │   │   └── ProjectRepository.ts
│   │   ├── types/
│   │   │   └── project.types.ts
│   │   └── index.ts
│   │
│   ├── chat/
│   │   ├── dto/
│   │   │   ├── SendMessageDto.ts
│   │   │   └── CreateConversationDto.ts
│   │   ├── services/
│   │   │   ├── ChatService.ts
│   │   │   └── ContextService.ts
│   │   ├── repositories/
│   │   │   ├── MessageRepository.ts
│   │   │   └── ConversationRepository.ts
│   │   ├── types/
│   │   │   └── chat.types.ts
│   │   └── index.ts
│   │
│   ├── generation/
│   │   ├── dto/
│   │   │   ├── CreateGenerationDto.ts
│   │   │   ├── RetryGenerationDto.ts
│   │   │   └── CancelGenerationDto.ts
│   │   ├── services/
│   │   │   ├── GenerationService.ts
│   │   │   ├── GenerationQueueService.ts
│   │   │   └── GenerationStatusService.ts
│   │   ├── repositories/
│   │   │   └── GenerationRepository.ts
│   │   ├── clients/
│   │   │   ├── AiServiceClient.ts
│   │   │   └── ModelServiceClient.ts
│   │   ├── types/
│   │   │   └── generation.types.ts
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── dto/
│   │   │   └── ModelQueryDto.ts
│   │   ├── services/
│   │   │   └── ModelService.ts
│   │   ├── repositories/
│   │   │   └── ModelRepository.ts
│   │   ├── types/
│   │   │   └── model.types.ts
│   │   └── index.ts
│   │
│   └── files/
│       ├── dto/
│       │   └── UploadFileDto.ts
│       ├── services/
│       │   └── FileService.ts
│       ├── types/
│       │   └── file.types.ts
│       └── index.ts
│
├── lib/
│   │
│   ├── prisma/
│   │   ├── client.ts
│   │   └── index.ts
│   │
│   ├── redis/
│   │   ├── client.ts
│   │   ├── queue.ts
│   │   └── index.ts
│   │
│   ├── http/
│   │   ├── api-client.ts
│   │   └── errors.ts
│   │
│   ├── validation/
│   │   └── schemas.ts
│   │
│   └── utils/
│       ├── logger.ts
│       ├── ids.ts
│       └── files.ts
│
├── hooks/
│   ├── useChat.ts
│   ├── useGeneration.ts
│   ├── useProject.ts
│   ├── useModelViewer.ts
│   └── useGenerationStream.ts
│
├── stores/
│   ├── chatStore.ts
│   ├── viewerStore.ts
│   ├── projectStore.ts
│   └── generationStore.ts
│
├── types/
│   ├── api.types.ts
│   ├── chat.types.ts
│   ├── generation.types.ts
│   └── model.types.ts
│
├── services/
│   └── ai/
│       └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── python-services/
│   │
│   ├── ai-service/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── routes/
│   │   │   │   │   ├── analyze.py
│   │   │   │   │   └── chat.py
│   │   │   │   └── router.py
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── requests.py
│   │   │   │   └── responses.py
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── base.py
│   │   │   │   ├── gemini.py
│   │   │   │   └── mistral.py
│   │   │   │
│   │   │   ├── router/
│   │   │   │   └── ai_router.py
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── prompt_service.py
│   │   │   │   ├── vision_service.py
│   │   │   │   └── intent_service.py
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   └── logging.py
│   │   │   │
│   │   │   └── main.py
│   │   │
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── README.md
│   │
│   └── model-service/
│       ├── app/
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   │   ├── generate.py
│       │   │   │   └── health.py
│       │   │   └── router.py
│       │   │
│       │   ├── dto/
│       │   │   ├── requests.py
│       │   │   └── responses.py
│       │   │
│       │   ├── generators/
│       │   │   ├── base.py
│       │   │   ├── trellis.py
│       │   │   ├── hunyuan.py
│       │   │   └── triposr.py
│       │   │
│       │   ├── router/
│       │   │   └── model_router.py
│       │   │
│       │   ├── services/
│       │   │   ├── generation_service.py
│       │   │   └── model_service.py
│       │   │
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   └── logging.py
│       │   │
│       │   └── main.py
│       │
│       ├── tests/
│       ├── requirements.txt
│       ├── Dockerfile
│       └── README.md
│
├── public/
│   ├── models/
│   └── images/
│
├── docker/
│   ├── postgres/
│   └── redis/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── README.md
└── PROJECT_SPEC.md
```

---

# 8. DTO Architecture

The application must use DTOs.

Never pass arbitrary request bodies directly to business logic.

Example:

```typescript
export class CreateGenerationDto {
  projectId: string;
  conversationId: string;
  prompt: string;
  imageIds?: string[];
  quality?: GenerationQuality;
  model?: string;
}
```

Validate using Zod.

Example:

```typescript
export const CreateGenerationSchema = z.object({
  projectId: z.string().uuid(),
  conversationId: z.string().uuid(),
  prompt: z.string().min(1).max(5000),
  imageIds: z.array(z.string()).optional(),
  quality: z.enum(["FAST", "STANDARD", "HIGH"]).default("STANDARD"),
  model: z.string().optional(),
});
```

Flow:

```text
HTTP Request
     ↓
DTO
     ↓
Validation
     ↓
Service
     ↓
Repository / External Client
```

---

# 9. Service Layer

Controllers/API routes must remain thin.

Bad:

```text
route.ts
 └── contains database logic
 └── contains AI logic
 └── contains generation logic
```

Good:

```text
route.ts
   ↓
DTO
   ↓
GenerationService
   ↓
GenerationRepository
   ↓
Database
```

For external services:

```text
GenerationService
       ↓
AiServiceClient
       ↓
Python AI Service
```

and:

```text
GenerationService
       ↓
ModelServiceClient
       ↓
Python Model Service
```

---

# 10. Database

Use PostgreSQL + Prisma.

## User

```text
id
email
name
passwordHash
createdAt
updatedAt
```

## Project

```text
id
userId
name
description
createdAt
updatedAt
```

## Conversation

```text
id
projectId
title
createdAt
updatedAt
```

## Message

```text
id
conversationId
role
content
metadata
createdAt
```

Roles:

```text
USER
ASSISTANT
SYSTEM
```

## Attachment

```text
id
messageId
fileName
mimeType
fileSize
localPath
createdAt
```

For MVP, attachments may use temporary local paths.

Do not use object storage.

## Generation

```text
id
projectId
conversationId
status
prompt
generationType
aiProvider
modelProvider
modelName
error
createdAt
updatedAt
```

## ModelVersion

```text
id
generationId
projectId
version
filePath
format
fileSize
triangleCount
vertexCount
createdAt
```

---

# 11. Generation Status

Use:

```text
QUEUED
ANALYZING
GENERATING
COMPLETED
FAILED
CANCELLED
```

Do not add unnecessary states initially.

---

# 12. AI Service

Python + FastAPI.

Responsibilities:

* Understand user input.
* Analyze images.
* Understand conversation context.
* Identify user intent.
* Generate structured instructions.
* Select AI provider.
* Return validated JSON.

The AI service does NOT generate 3D geometry.

---

# 13. AI Provider Abstraction

Create:

```python
class AIProvider:
    async def analyze_image(self, image):
        raise NotImplementedError

    async def analyze_prompt(self, prompt, context):
        raise NotImplementedError

    async def create_generation_instruction(self, prompt, context):
        raise NotImplementedError
```

Implement:

```text
GeminiProvider
MistralProvider
```

---

# 14. AI Router

Create:

```python
class AIRouter:
    def select_provider(self, task):
        ...
```

Possible tasks:

```text
IMAGE_ANALYSIS
PROMPT_ANALYSIS
INTENT_CLASSIFICATION
GENERATION_INSTRUCTION
CONVERSATION
```

Initially, use configuration-based routing.

Example:

```env
DEFAULT_AI_PROVIDER=gemini
VISION_PROVIDER=gemini
REASONING_PROVIDER=mistral
```

Do not hardcode providers throughout the application.

---

# 15. AI Output Schema

The AI service must return structured output.

Example:

```json
{
  "intent": "GENERATE_MODEL",
  "mode": "IMAGE_TO_3D",
  "object": "gaming chair",
  "description": "premium futuristic gaming chair",
  "style": "futuristic",
  "materials": [
    "carbon fiber",
    "leather"
  ],
  "colors": [
    "black",
    "red"
  ],
  "preserve_reference": true,
  "quality": "HIGH",
  "model_preference": "TRELLIS",
  "instructions": [
    "Preserve the overall silhouette",
    "Use the uploaded image as the primary reference",
    "Add futuristic design details"
  ]
}
```

Use Pydantic to validate this response.

---

# 16. Supported Intents

Implement:

```text
GENERATE_MODEL
REGENERATE_MODEL
MODIFY_MODEL
CHANGE_COLOR
CHANGE_MATERIAL
CHANGE_STYLE
ANALYZE_MODEL
OPTIMIZE_MODEL
EXPORT_MODEL
```

Important:

Not every intent needs to directly modify geometry in the MVP.

For operations unsupported by the selected 3D model, the AI should fall back to regeneration.

Example:

```text
User:
"Make the chair wider."

AI:
MODIFY_MODEL

Backend:
Current model cannot be directly edited.

Fallback:
REGENERATE_MODEL using current model/reference + instruction.
```

---

# 17. Model Service

Python + FastAPI.

Responsibilities:

* Receive generation instructions.
* Receive image references.
* Select a 3D model.
* Generate 3D geometry.
* Generate/return textures where supported.
* Produce GLB/GLTF.
* Return metadata.

---

# 18. Model Abstraction

Create:

```python
class ThreeDGenerator:
    async def generate(
        self,
        image_path: str,
        instruction: dict
    ):
        raise NotImplementedError
```

Implement:

```text
TrellisGenerator
HunyuanGenerator
TripoSRGenerator
```

The rest of the system must never directly depend on a specific model implementation.

---

# 19. Model Router

Create:

```python
class ModelRouter:
    def select_model(self, instruction):
        ...
```

Example:

```text
HIGH quality
     ↓
TRELLIS / Hunyuan3D

FAST
     ↓
TripoSR
```

Configuration:

```env
DEFAULT_3D_MODEL=trellis
FAST_3D_MODEL=triposr
HIGH_QUALITY_3D_MODEL=trellis
```

---

# 20. Hugging Face Integration

3D models should be loaded from Hugging Face or another supported inference source.

Do not hardcode model implementation details inside API routes.

Keep model configuration in:

```text
model-service/app/core/config.py
```

Example:

```env
TRELLIS_MODEL_ID=
HUNYUAN_MODEL_ID=
TRIPOSR_MODEL_ID=
```

Model weights should not be committed to Git.

---

# 21. Local File Handling

Since this is an MVP:

```text
temporary/uploads/
temporary/generated/
temporary/previews/
```

Use these directories for local files.

Add them to `.gitignore`.

Example:

```text
/tmp
temporary/
generated/
uploads/
```

Do not commit generated models.

---

# 22. Model Output

The model service should return:

```json
{
  "success": true,
  "model": {
    "format": "glb",
    "path": "/temporary/generated/model_123.glb",
    "fileSize": 2847392,
    "triangleCount": 54321,
    "vertexCount": 27890
  }
}
```

The API gateway should convert this into the application's response format.

---

# 23. Three.js Viewer

Use:

* Three.js
* React Three Fiber
* Drei

Component:

```text
ModelViewer.tsx
```

Support:

* GLB loading
* GLTF loading
* OrbitControls
* Zoom
* Pan
* Auto rotate
* Reset camera
* Fullscreen
* Grid
* Environment lighting
* Wireframe toggle
* Model statistics

---

# 24. Viewer Architecture

```text
ModelViewer
├── Canvas
├── Scene
├── Camera
├── Lights
├── Environment
├── Model
├── OrbitControls
└── ViewerControls
```

Use dynamic imports where required to avoid SSR issues.

---

# 25. Chat UI

The chat is the primary interface.

Example:

```text
┌────────────────────────────────────────────┐
│ AI 3D Studio                               │
├────────────────────────────────────────────┤
│                                            │
│ AI                                         │
│ What would you like to create?             │
│                                            │
│ User                                       │
│ Create a futuristic gaming chair.          │
│                                            │
│ User                                       │
│ [reference-image.jpg]                      │
│ Make it similar to this but more premium.  │
│                                            │
│ AI                                         │
│ Analyzing your reference...                │
│                                            │
│ AI                                         │
│ Generating 3D model...                     │
│                                            │
├────────────────────────────────────────────┤
│ 📎  Ask AI to modify your model...     ➤   │
└────────────────────────────────────────────┘
```

---

# 26. Chat Context

The AI must receive relevant context.

Example:

```json
{
  "currentProject": {
    "id": "project_123"
  },
  "currentModel": {
    "version": 3,
    "type": "gaming_chair"
  },
  "recentMessages": [],
  "references": [],
  "userInstruction": "Make it black"
}
```

Do not send the entire conversation indefinitely.

Use recent messages + current model context.

---

# 27. Example Conversation

### First message

```text
Create a premium futuristic gaming chair.
```

AI:

```text
Intent:
GENERATE_MODEL
```

Generate Version 1.

---

### Second message

```text
Make it black with red accents.
```

AI:

```text
Intent:
CHANGE_COLOR
```

If the model supports material modification:

```text
Modify current asset.
```

Otherwise:

```text
Regenerate Version 2.
```

---

### Third message

```text
Use this image as reference.
```

AI:

```text
Reference image added.
```

---

### Fourth message

```text
Keep the shape from the current model but use the design language from this image.
```

AI:

```text
GENERATE_MODEL
```

Generate Version 3.

---

# 28. Generation Pipeline

## Request

```text
POST /api/generations
```

### Step 1

Validate:

```text
CreateGenerationDto
```

### Step 2

Create database record:

```text
status = QUEUED
```

### Step 3

Add generation job to Redis.

### Step 4

AI service analyzes request.

### Step 5

Update:

```text
status = ANALYZING
```

### Step 6

Receive structured instruction.

### Step 7

Send instruction to model service.

### Step 8

Update:

```text
status = GENERATING
```

### Step 9

Model service generates GLB.

### Step 10

Save model locally.

### Step 11

Create ModelVersion.

### Step 12

Update:

```text
status = COMPLETED
```

### Step 13

Frontend loads GLB.

---

# 29. Redis

Use Redis for generation jobs.

Why:

3D generation can take much longer than normal HTTP requests.

Do not keep a request open while the model is generating.

Use:

```text
POST /api/generations
```

Response:

```json
{
  "generationId": "gen_123",
  "status": "QUEUED"
}
```

Frontend then listens for updates.

---

# 30. Real-Time Updates

Use Server-Sent Events initially.

Endpoint:

```text
GET /api/generations/:generationId/stream
```

Events:

```text
QUEUED
ANALYZING
GENERATING
COMPLETED
FAILED
```

Example:

```text
data: {
  "status": "GENERATING",
  "progress": 65
}
```

---

# 31. API Endpoints

## Projects

```http
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

## Conversations

```http
POST /api/projects/:projectId/conversations
GET  /api/projects/:projectId/conversations
GET  /api/conversations/:id
```

## Messages

```http
POST /api/conversations/:id/messages
GET  /api/conversations/:id/messages
```

## Generations

```http
POST /api/generations
GET  /api/generations/:id
POST /api/generations/:id/retry
POST /api/generations/:id/cancel
GET  /api/generations/:id/stream
```

## Models

```http
GET /api/models
GET /api/models/:id
```

## Health

```http
GET /api/health
```

---

# 32. API Response Format

Use a consistent response format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "3D generation failed"
  }
}
```

---

# 33. Error Codes

Create standardized error codes:

```text
INVALID_REQUEST
UNAUTHORIZED
PROJECT_NOT_FOUND
CONVERSATION_NOT_FOUND
GENERATION_NOT_FOUND
FILE_TOO_LARGE
INVALID_FILE
AI_SERVICE_UNAVAILABLE
MODEL_SERVICE_UNAVAILABLE
GENERATION_FAILED
MODEL_NOT_SUPPORTED
INTERNAL_ERROR
```

---

# 34. File Upload

For MVP:

* Accept JPG
* JPEG
* PNG
* WEBP

Maximum size:

```text
10 MB
```

Validate:

* MIME type
* extension
* file size

Store temporarily:

```text
temporary/uploads/
```

Generate unique filenames.

Never trust the original filename.

---

# 35. Security

Implement:

* Request validation
* File validation
* Rate limiting
* CORS
* Authentication
* Authorization
* API key protection
* Environment variables
* Request IDs

Never expose:

```text
GEMINI_API_KEY
MISTRAL_API_KEY
```

to the browser.

---

# 36. Environment Variables

Create `.env.example`.

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai3dstudio

# Redis
REDIS_URL=redis://localhost:6379

# AI
GEMINI_API_KEY=
MISTRAL_API_KEY=

DEFAULT_AI_PROVIDER=gemini
VISION_PROVIDER=gemini
REASONING_PROVIDER=mistral

# 3D Models
DEFAULT_3D_MODEL=trellis
FAST_3D_MODEL=triposr
HIGH_QUALITY_3D_MODEL=trellis

TRELLIS_MODEL_ID=
HUNYUAN_MODEL_ID=
TRIPOSR_MODEL_ID=

# Python services
AI_SERVICE_URL=http://localhost:8001
MODEL_SERVICE_URL=http://localhost:8002

# Authentication
JWT_SECRET=
```

---

# 37. Docker Compose

For MVP:

```text
nextjs
postgres
redis
ai-service
model-service
```

Do not include:

```text
S3
R2
Blender
processing-service
file-service
```

Example:

```yaml
services:

  app:
    build: .
    ports:
      - "3000:3000"

  postgres:
    image: postgres:16
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  ai-service:
    build: ./python-services/ai-service
    ports:
      - "8001:8000"

  model-service:
    build: ./python-services/model-service
    ports:
      - "8002:8000"
```

GPU configuration should be added separately for machines with NVIDIA GPUs.

---

# 38. AI Service API

## Analyze Request

```http
POST /analyze
```

Input:

```json
{
  "prompt": "Make this chair futuristic",
  "images": [
    "/temporary/uploads/reference.jpg"
  ],
  "context": {
    "currentModel": null,
    "recentMessages": []
  }
}
```

Output:

```json
{
  "intent": "GENERATE_MODEL",
  "mode": "IMAGE_TO_3D",
  "object": "chair",
  "instructions": []
}
```

---

# 39. Model Service API

## Generate

```http
POST /generate
```

Input:

```json
{
  "imagePath": "/temporary/uploads/reference.jpg",
  "instruction": {
    "object": "gaming chair",
    "style": "futuristic",
    "quality": "HIGH"
  }
}
```

Output:

```json
{
  "success": true,
  "model": {
    "path": "/temporary/generated/model.glb",
    "format": "glb"
  }
}
```

---

# 40. Model Provider Abstraction

Never write:

```python
if model == "trellis":
    ...
```

throughout the codebase.

Instead:

```python
generator = model_router.select_model(config)

result = await generator.generate(
    image_path=image_path,
    instruction=instruction
)
```

This makes future model additions easy.

---

# 41. AI Provider Abstraction

Never write:

```python
if provider == "gemini":
    ...
elif provider == "mistral":
    ...
```

inside business logic.

Use:

```python
provider = ai_router.select_provider(task)

result = await provider.create_generation_instruction(...)
```

---

# 42. Frontend State Management

Use Zustand only for client-side UI state.

Example:

```text
currentProject
currentConversation
currentModel
selectedVersion
viewerSettings
generationStatus
```

Use TanStack Query for server state.

Do not duplicate API data unnecessarily inside Zustand.

---

# 43. Loading States

Implement proper loading states.

Chat:

```text
AI is thinking...
```

Generation:

```text
Analyzing reference...
Generating geometry...
Creating model...
Preparing preview...
```

Viewer:

```text
Loading 3D model...
```

---

# 44. Generation UI

Display:

```text
Generation #123

Status:
Generating

██████████████░░░░░░ 68%

Model:
TRELLIS

Quality:
HIGH

Started:
11:32 AM
```

---

# 45. Version System

Every successful generation creates a new version.

Example:

```text
Project
 │
 ├── Model Version 1
 ├── Model Version 2
 ├── Model Version 3
 └── Model Version 4
```

Each version stores:

```text
prompt
generationId
model
AI provider
createdAt
filePath
format
metadata
```

---

# 46. Model Viewer Controls

Add:

```text
Rotate
Zoom
Pan
Reset
Auto Rotate
Wireframe
Grid
Fullscreen
Environment
```

Keep viewer controls modular.

---

# 47. Model Metadata

Display:

```text
Format: GLB
Vertices: 32,450
Triangles: 62,120
Materials: 4
Textures: 3
File Size: 4.8 MB
Generation Model: TRELLIS
Version: 3
```

---

# 48. Download

Allow:

```text
Download GLB
```

For MVP, serve the local generated file through a controlled Next.js route.

Example:

```text
GET /api/models/:id/download
```

Do not expose arbitrary filesystem paths.

---

# 49. Project Dashboard

Dashboard should show:

```text
Projects

+ Create Project

┌───────────────┐
│ Gaming Chair  │
│ 4 versions    │
│ Updated 2m ago│
└───────────────┘
```

---

# 50. Studio Layout

Use a two-panel interface.

```text
┌───────────────────────────────────────────────────────────┐
│ AI 3D STUDIO                         Project    Settings   │
├────────────────────────────┬──────────────────────────────┤
│                            │                              │
│                            │                              │
│                            │            CHAT              │
│                            │                              │
│       3D VIEWER            │                              │
│                            │                              │
│                            │                              │
│                            │                              │
├────────────────────────────┤──────────────────────────────┤
│ Model info                 │ 📎 Ask AI...              ➤ │
├────────────────────────────┴──────────────────────────────┤
│ Version 1   Version 2   Version 3      Download GLB       │
└───────────────────────────────────────────────────────────┘
```

---

# 51. Responsive Design

Desktop:

```text
Viewer 60%
Chat 40%
```

Tablet:

```text
Viewer
Chat
```

Mobile:

```text
Viewer
↓
Chat
```

---

# 52. UI Principles

Use:

* Dark modern interface.
* Minimal borders.
* Good spacing.
* Subtle animations.
* Clear generation states.
* Premium 3D software feeling.
* No unnecessary dashboard clutter.

Avoid copying the exact UI of existing products.

---

# 53. Authentication

For MVP, implement simple authentication.

Options:

* JWT
* HTTP-only cookies

Do not expose tokens in localStorage if avoidable.

Protect:

```text
/projects
/studio
/api/projects
/api/generations
```

---

# 54. Testing

Frontend:

```text
Vitest
React Testing Library
```

Backend:

```text
Vitest/Jest
```

Python:

```text
pytest
```

Test:

* DTO validation
* AI provider selection
* AI output validation
* Model provider selection
* Generation status transitions
* API routes
* Error handling

---

# 55. Health Checks

Next.js:

```text
GET /api/health
```

AI service:

```text
GET /health
```

Model service:

```text
GET /health
```

Health response:

```json
{
  "status": "ok"
}
```

---

# 56. Logging

Every generation should have:

```text
requestId
generationId
projectId
conversationId
```

Example:

```text
[gen_123]
[project_456]
[request_789]

Starting AI analysis
```

Never log API keys or sensitive data.

---

# 57. Development Phases

## Phase 1 — Project Foundation

Implement:

```text
Next.js
TypeScript
Tailwind
Prisma
PostgreSQL
Redis
```

Create:

```text
Project
Conversation
Message
Generation
ModelVersion
```

---

# 58. Phase 2 — Chat

Implement:

```text
Chat UI
Messages
Conversation persistence
Image upload
DTO validation
```

Do not integrate 3D yet.

---

# 59. Phase 3 — AI Service

Implement:

```text
FastAPI
Gemini
Mistral
Provider abstraction
AI router
Pydantic schemas
```

Test:

```text
Image + prompt
       ↓
Structured JSON
```

before integrating 3D.

---

# 60. Phase 4 — Model Service

Implement:

```text
FastAPI
Model abstraction
Model router
One 3D model
```

Start with one model only.

Get:

```text
Image
 ↓
3D
 ↓
GLB
```

working independently.

---

# 61. Phase 5 — Integration

Connect:

```text
Next.js
 ↓
AI Service
 ↓
Model Service
```

Then introduce Redis for asynchronous generation.

---

# 62. Phase 6 — Three.js

Implement:

```text
GLB loading
Viewer
Controls
Statistics
Fullscreen
Download
```

---

# 63. Phase 7 — Conversational Iteration

Implement:

```text
Version 1
 ↓
User instruction
 ↓
Version 2
 ↓
User instruction
 ↓
Version 3
```

Maintain model context.

---

# 64. Phase 8 — Multiple Models

Add:

```text
TRELLIS
Hunyuan3D
TripoSR
```

behind the same interface.

---

# 65. Phase 9 — Production Improvements

Only after MVP works consider adding:

```text
Cloudflare R2
S3
GPU workers
Blender processing
Model optimization
CDN
Kubernetes
Advanced monitoring
Billing
Usage limits
```

Do NOT implement these in the initial MVP.

---

# 66. Important Technical Constraint

The MVP must not assume that an LLM itself generates the 3D mesh.

The responsibilities are:

```text
Gemini / Mistral
        =
Understanding + reasoning

Hugging Face 3D model
        =
3D geometry generation

Three.js
        =
3D visualization
```

---

# 67. Important Technical Constraint — Model Editing

Do not claim that every natural-language modification can directly edit an existing mesh.

For example:

```text
"Change the color to red"
```

may be handled as a material operation.

But:

```text
"Make the chair 20% wider"
```

may require regeneration if the selected model doesn't support direct mesh editing.

The AI orchestration layer must determine whether to:

```text
MODIFY
```

or:

```text
REGENERATE
```

---

# 68. MVP Success Criteria

The project is considered functional when this complete flow works:

```text
User opens application
        ↓
Creates project
        ↓
Opens studio
        ↓
Types:

"Create a futuristic gaming chair"
        ↓
AI analyzes request
        ↓
3D generation pipeline runs
        ↓
GLB generated
        ↓
GLB appears in Three.js viewer
        ↓
User says:

"Make it black with red accents"
        ↓
AI understands current model
        ↓
New generation/version
        ↓
Version 2 appears
        ↓
User uploads reference image
        ↓
User says:

"Use this design language"
        ↓
Version 3 generated
        ↓
User downloads GLB
```

---

# 69. Non-Goals for MVP

Do NOT implement initially:

```text
❌ Cloud storage
❌ Billing
❌ Payments
❌ Team collaboration
❌ Blender processing
❌ Advanced mesh editing
❌ Kubernetes
❌ Multi-region deployment
❌ CDN
❌ Complex RBAC
❌ Enterprise authentication
❌ Automatic LOD generation
❌ Advanced texture baking
```

---

# 70. Coding Standards

Follow these rules strictly.

### TypeScript

* Strict mode.
* Avoid `any`.
* Use interfaces/types.
* Validate external input.
* Use DTOs.
* Use services.
* Use repositories.
* Keep API routes thin.

### Python

* Python 3.11+.
* Type hints.
* Pydantic.
* FastAPI.
* Async where appropriate.
* Provider abstraction.
* Model abstraction.
* Environment-based configuration.

### React

* Functional components.
* Small reusable components.
* Avoid huge components.
* Server components where appropriate.
* Client components only when required.
* Keep business logic outside UI components.

---

# 71. Dependency Rules

Frontend should NOT directly import:

```text
Prisma
Python code
AI provider SDKs
3D model libraries
```

Frontend communicates with Next.js API.

Next.js communicates with Python services.

Python services communicate with AI/3D providers.

---

# 72. Final Dependency Graph

```text
                    FRONTEND
                       │
                       ▼
                   NEXT.JS
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       Prisma        Redis      Python APIs
          │            │            │
          ▼            ▼       ┌────┴────┐
      PostgreSQL     Queue      │         │
                                ▼         ▼
                           AI Service  Model Service
                                │         │
                          Gemini/Mistral  │
                                          │
                                TRELLIS/Hunyuan/TripoSR
```

---

# 73. Final MVP Technology Stack

```text
Frontend
---------
Next.js
React
TypeScript
Tailwind
React Three Fiber
Three.js
Drei
Zustand
TanStack Query
Zod


Application/API
----------------
Next.js Route Handlers
DTO architecture
Service layer
Repository layer
Prisma


Database
--------
PostgreSQL


Queue
-----
Redis


AI Service
----------
Python
FastAPI
Pydantic
Gemini
Mistral


3D Service
----------
Python
FastAPI
Hugging Face
TRELLIS
Hunyuan3D
TripoSR


Storage
-------
Temporary local filesystem only


3D Output
---------
GLB
GLTF
```

---

# 74. Golden Rule

Build the system so that these components can be replaced independently:

```text
Gemini
   ↓
Mistral
   ↓
Future LLM


TRELLIS
   ↓
Hunyuan3D
   ↓
TripoSR
   ↓
Future 3D model


Local filesystem
   ↓
R2/S3


Redis
   ↓
Future distributed queue
```

The rest of the application must continue working without major architectural changes.

---

# 75. Implementation Instruction

When implementing this project:

1. Do not generate the entire codebase blindly in one step.
2. Build one layer at a time.
3. Verify each layer before continuing.
4. Create DTOs and interfaces before implementations.
5. Keep API routes thin.
6. Keep AI providers abstract.
7. Keep 3D generators abstract.
8. Do not hardcode API keys.
9. Do not commit model weights.
10. Do not introduce production infrastructure prematurely.
11. Prefer working MVP functionality over unnecessary abstraction.
12. Keep the architecture extensible.

Start with:

```text
Next.js
+
PostgreSQL
+
Prisma
+
Redis
+
Chat
```

Then implement the AI service.

Then implement one 3D generation model.

Then connect everything.

Then add the remaining models.

---

# END OF PROJECT SPECIFICATION
