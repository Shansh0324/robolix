import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function generateRequestId(): string {
  return `req_${uuidv4().split("-")[0]}`;
}

export function generateGenerationId(): string {
  return `gen_${uuidv4().split("-")[0]}`;
}
