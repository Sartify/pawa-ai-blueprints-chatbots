export type MessageRole = 'user' | 'assistant';

export interface FileAttachment {
  id?: number;
  messageId?: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isLoading?: boolean;
}

export type MessageFile = File | {
  name: string;
  size: number;
  type: string;
  lastModified?: number;
};

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  serverId?: string | number;
  files?: FileAttachment[];
  isGenerating?: boolean;
  error?: boolean;
  hasPendingUploads?: boolean;
}

// export type Message = {
//   from: "user" | "agent";
//   text: string;
// };
