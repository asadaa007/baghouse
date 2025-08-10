export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerName?: string;
  members: ProjectMember[];
  settings: ProjectSettings;
  status: 'active' | 'inactive' | 'on_hold' | 'discontinued' | 'complete';
  statusReason?: string | null;
  teamId?: string; // Assigned team
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'manager' | 'team_lead' | 'admin' | 'member' | 'viewer';
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