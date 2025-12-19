
export interface Card {
  icon: string;
  title: string;
  description?: string; // optional
  items?: string[];     // optional
  iconHex?: string;
  borderColor?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}