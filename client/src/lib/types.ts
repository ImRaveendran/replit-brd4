export interface UserStory {
  story_name: string;
  description: string;
  label: string;
  status: string;
  acceptance_criteria: string[];
  nfrs: string[];
  definition_of_done: string[];
  definition_of_ready: string[];
}

export interface Epic {
  epic_name: string;
  epic_description: string;
  user_stories: UserStory[];
}

export interface GenerationResult {
  epics: Epic[];
}

export interface Generation {
  id: number;
  documentId: number;
  epics: Epic[] | any;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

export interface UploadResponse {
  documentId: number;
  generationId: number;
  message: string;
}
