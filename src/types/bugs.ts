export interface Bug {
  id: string;
  customId?: string;
  title: string;
  description: string;
  status: BugStatus;
  priority: BugPriority;
  assignee?: string;
  assigneeName?: string;
  externalAssignee?: string;
  externalAssigneeName?: string;
  reporter: string;
  reporterName?: string;
  projectId: string;
  projectName?: string;
  labels: string[];
  attachments: Attachment[];
  comments: Comment[];
  history: BugHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  userId?: string;
  userName?: string;
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

export interface BugHistoryEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName?: string;
  createdAt: Date;
}

export interface BugFilters {
  status?: BugStatus[];
  priority?: BugPriority[];
  assignee?: string;
  labels?: string[];
  projectName?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
} 