export interface SurveyOption {
  text: string;
  votes: number;
}

export interface Survey {
  id: string;
  question: string;
  options: SurveyOption[];
  timestamp: Date;
}
