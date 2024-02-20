export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  deckId: string;
  frontMarkdown: string;
  backMarkdown: string;
  repetitions: number;
  intervalDays: number;
  easinessFactor: number; // default 2.5
  nextReviewDate: string; // YYYY-MM-DD
  version: number;
  deleted: boolean;
  updatedAt: string;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  reviewedAt: string;
  grade: ReviewGrade;
  scheduledInterval: number;
}
