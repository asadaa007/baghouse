export interface Bug {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  assignee?: string;
  reporter: string;
  projectId: string;
  labels: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface BugFilters {
  status?: BugStatus[];
  priority?: BugPriority[];
  assignee?: string;
  labels?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
} 