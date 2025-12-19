// src/mastra/rag/memory.ts
export type Role = "user" | "assistant";

export interface MemoryMessage {
  role: Role;
  content: string;
}

export class ConversationMemory {
  private messages: MemoryMessage[] = [];

  add(role: Role, content: string) {
    this.messages.push({ role, content });
  }

  get() {
    return this.messages;
  }

  clear() {
    this.messages = [];
  }
}
