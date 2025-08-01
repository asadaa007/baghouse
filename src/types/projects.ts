export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: ProjectMember[];
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface ProjectSettings {
  allowPublicAccess: boolean;
  requireApproval: boolean;
  autoAssign: boolean;
  defaultAssignee?: string;
  customFields: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  required: boolean;
  options?: string[];
} 