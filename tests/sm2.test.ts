import { SuperMemo2Engine } from '../src/algorithm/SuperMemo2Engine';
import { CrossDeviceSyncEngine } from '../src/sync/CrossDeviceSyncEngine';
import { Flashcard } from '../src/types';

describe('SuperMemo SM-2 & Cross-Device Sync', () => {
  const baseCard: Flashcard = {
    id: 'card_algorithms_101',
    deckId: 'deck_cs',
    frontMarkdown: 'What is the time complexity of QuickSort average case?',
    backMarkdown: 'O(N log N)',
    repetitions: 0,
    intervalDays: 0,
    easinessFactor: 2.5,
    nextReviewDate: '2024-04-01',
    version: 1,
    deleted: false,
    updatedAt: '2024-04-01T00:00:00Z'
  };

  test('advances intervals progressively on perfect responses (grade 5)', () => {
    const reviewDate = new Date('2024-04-01T00:00:00Z');

    // First review: grade 5 -> rep 1, interval 1 day
    const rev1 = SuperMemo2Engine.processReview(baseCard, 5, reviewDate);
    expect(rev1.repetitions).toBe(1);
    expect(rev1.intervalDays).toBe(1);
    expect(rev1.easinessFactor).toBe(2.6); // 2.5 + (0.1 - 0) = 2.6

    // Second review: grade 5 -> rep 2, interval 6 days
    const rev2 = SuperMemo2Engine.processReview(rev1, 5, reviewDate);
    expect(rev2.repetitions).toBe(2);
    expect(rev2.intervalDays).toBe(6);

    // Third review: grade 5 -> rep 3, interval = round(6 * 2.7) = 16 days
    const rev3 = SuperMemo2Engine.processReview(rev2, 5, reviewDate);
    expect(rev3.repetitions).toBe(3);
    expect(rev3.intervalDays).toBe(16);
  });

  test('resets interval and repetitions on failed recall (grade 1)', () => {
    const advancedCard: Flashcard = {
      ...baseCard,
      repetitions: 4,
      intervalDays: 24,
      easinessFactor: 2.5
    };

    const failedRev = SuperMemo2Engine.processReview(advancedCard, 1);
    expect(failedRev.repetitions).toBe(0);
    expect(failedRev.intervalDays).toBe(1);
    expect(failedRev.easinessFactor).toBeLessThan(2.5);
  });

  test('cross-device sync engine resolves remote version conflicts deterministically', () => {
    const syncEngine = new CrossDeviceSyncEngine();
    syncEngine.upsertLocal(baseCard);

    // Remote card with higher version
    const remoteCard: Flashcard = {
      ...baseCard,
      version: 3,
      backMarkdown: 'Updated correct answer'
    };

    const res = syncEngine.applyRemoteSyncDeltas([remoteCard]);
    expect(res.updatedCount).toBe(1);
    expect(syncEngine.getAllCards()[0].backMarkdown).toBe('Updated correct answer');
  });
});
