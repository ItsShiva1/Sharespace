export type Tier = 'guest' | 'free' | 'prime' | 'team';
export type PlanId = 'free' | 'prime' | 'team';

export interface User {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  avatar?: string;
  joinedAt: Date;
  planId?: PlanId;
  planExpiresAt?: Date | null;
  reservedSlugs?: string[];
}

export interface FileTab {
  id: string;
  name: string;
  content: string;
  language: string;
  isActive: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; 
  progress?: number;
  uploadedAt: Date;
}

export interface SnippetEntry {
  id: string;
  title: string;
  slug?: string;
  tabs: FileTab[];
  uploads: UploadedFile[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  lang: string;
  isPublic: boolean;
  isReadOnly: boolean;
  hasPassword: boolean;
  password?: string;
  views: number;
  shareUrl: string;
  customShareUrl?: string;
  tags: string[];
  version: number;
  forkOf?: string;
  encryptionEnabled: boolean;
}

export interface HistoryEntry {
  id: string;
  snippetId: string;
  title: string;
  slug?: string;
  lang: string;
  preview: string;
  createdAt: Date;
  expiresAt: Date | null;
  fileCount: number;
  uploadCount: number;
  isPinned: boolean;
  shareUrl: string;
  views: number;
  tags: string[];
  uploads?: UploadedFile[];
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  yearlyPrice: number;
  color: string;
  gradient: string;
  icon: string;
  badge?: string;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  historyDays: number | null;
  maxUploads: number | null;
  maxUploadSizeMB: number;
  maxSnippets: number | null;
  customSlug: boolean;
  pinHistory: boolean;
  passwordProtect: boolean;
  analytics: boolean;
  teamMembers: number | null;
  prioritySupport: boolean;
  apiAccess: boolean;
  embedSupport: boolean;
}
