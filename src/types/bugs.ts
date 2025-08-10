export interface Bug {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  assignee?: string;
  assigneeName?: string;
  reporter: string;
  reporterName?: string;
  projectId: string;
  projectName?: string;
  labels: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type BugStatus = 'new' | 'in-progress' | 'review' | 'resolved' | 'closed';
export type BugPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  userId: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BugFilters {
  status?: BugStatus[];
  priority?: BugPriority[];
  assignee?: string;
  labels?: string[];
  projectId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
} 