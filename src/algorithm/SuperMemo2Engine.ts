import { Flashcard, ReviewGrade } from '../types';

export class SuperMemo2Engine {
  public static readonly MINIMUM_EF = 1.3;
  public static readonly DEFAULT_EF = 2.5;

  /**
   * SuperMemo SM-2 algorithm calculation:
   * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   * If grade < 3: reset repetitions to 0, interval to 1 day
   * Else:
   *   rep = 0 -> interval = 1
   *   rep = 1 -> interval = 6
   *   rep > 1 -> interval = round(prevInterval * EF)
   */
  public static processReview(card: Flashcard, grade: ReviewGrade, reviewDate: Date = new Date()): Flashcard {
    let nextRepetitions = card.repetitions;
    let nextIntervalDays = card.intervalDays;
    let nextEF = card.easinessFactor;

    // Calculate updated Easiness Factor
    nextEF = nextEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (nextEF < this.MINIMUM_EF) {
      nextEF = this.MINIMUM_EF;
    }

    if (grade < 3) {
      // Failed recall: reset repetition chain
      nextRepetitions = 0;
      nextIntervalDays = 1;
    } else {
      // Successful recall
      if (nextRepetitions === 0) {
        nextIntervalDays = 1;
      } else if (nextRepetitions === 1) {
        nextIntervalDays = 6;
      } else {
        nextIntervalDays = Math.round(card.intervalDays * nextEF);
      }
      nextRepetitions += 1;
    }

    const nextDueDate = new Date(reviewDate);
    nextDueDate.setDate(nextDueDate.getDate() + nextIntervalDays);

    return {
      ...card,
      repetitions: nextRepetitions,
      intervalDays: nextIntervalDays,
      easinessFactor: Math.round(nextEF * 100) / 100,
      nextReviewDate: nextDueDate.toISOString().split('T')[0],
      version: card.version + 1,
      updatedAt: reviewDate.toISOString()
    };
  }
}
