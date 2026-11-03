export interface SurveyOption {
  id: number;
  text: string;
  votes: number;
}

export interface Survey {
  id: string;
  question: string;
  options: SurveyOption[];
  timestamp: Date;
}

export interface VoteSchema {
  optionIndex: number;
}
