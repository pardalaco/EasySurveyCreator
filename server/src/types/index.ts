export interface SuveryOption {
  text: string;
  votes: number;
}

export interface Suvery {
  id: string;
  question: string;
  options: SuveryOption[];
}
