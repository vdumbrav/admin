// Bot Admin Types - Aligned with Backend Responses

// ==================== Stats ====================
export interface BotStats {
  today: {
    totalRequests: number;
    telegramUsers: number;
    matrixUsers: number;
    uniqueUsers: number;
  };
  mappings: {
    telegramChats: number;
    matrixRooms: number;
  };
}

// ==================== Users ====================
export interface BotUser {
  platform: 'matrix' | 'telegram';
  userId: string;
  usage: number;
  date: string;
  linkedUserId?: string | null;
  messageCount?: number;
}

export interface BotUsersResponse {
  users: BotUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== Limits ====================
export interface BotLimits {
  free: number;
  level1: number;
  level2: number;
  level3: number | null;
}

// ==================== Mappings ====================
export interface UserMapping {
  telegramChatId: string;
  matrixRoomId: string;
  isGroup: boolean;
}

export interface MappingsResponse {
  mappings: UserMapping[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== User Context ====================
export interface UserContext {
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  lastUpdated?: string;
}

// ==================== System Prompts ====================
export interface PromptsResponse {
  promptTypes: string[];
  overrides: Record<string, { content: string; updatedAt: string }>;
  hasOverrides: boolean;
}

// ==================== Knowledge Base ====================
export interface KnowledgeResponse {
  defaultTopics: string[];
  customEntries: Record<string, { content: string; updatedAt: string }>;
  totalEntries: number;
}

// ==================== Banned Words ====================
export interface BannedConfig {
  words: string[];
  topics: string[];
  regex: string[];
  updatedAt?: string;
}

// ==================== Custom Instructions ====================
export interface CustomInstructions {
  global: string;
  perLanguage: Record<string, string>;
  updatedAt?: string;
}

// ==================== AI Config ====================
export interface AIConfig {
  defaultModel: string;
  models: Record<string, string>;
  fallbackModel: string;
  maxTokens: number;
  temperature: number;
  updatedAt?: string;
}

// ==================== Response Templates ====================
export interface ResponseTemplate {
  trigger: string;
  response: string;
  language?: string;
  exact?: boolean;
  updatedAt?: string;
}

// ==================== Chat Logs ====================
export interface ChatLogEntry {
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  lastUpdated?: string;
}

export interface ChatLogsResponse {
  logs: ChatLogEntry[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== Training Export ====================
export interface TrainingExport {
  format: string;
  count: number;
  data: Array<{
    prompt: string;
    completion: string;
  }>;
}

// ==================== User Summary ====================
export interface UserSummary {
  userId: string;
  summary: string;
  topics: string[];
  sentiment: string;
  engagement: string;
  messageCount: number;
  lastInteraction?: string;
  // Extended profile data for marketing/personalization
  preferences?: {
    interests: string[];           // crypto topics they're interested in (BTC, ETH, DeFi, NFT)
    tradingStyle?: string;         // hodler, trader, investor, learner
    experienceLevel?: string;      // beginner, intermediate, advanced
    preferredLanguage?: string;
    communicationStyle?: string;   // formal, casual, technical
    activeHours?: string;          // morning, afternoon, evening, night
  };
  insights?: {
    potentialNeeds: string[];      // what products/services might interest them
    painPoints: string[];          // problems they mentioned
    goals: string[];               // what they want to achieve
  };
}
