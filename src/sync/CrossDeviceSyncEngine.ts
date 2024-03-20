import { Flashcard } from '../types';

export class CrossDeviceSyncEngine {
  private localStore: Map<string, Flashcard> = new Map();

  public upsertLocal(card: Flashcard): void {
    this.localStore.set(card.id, card);
  }

  public getDueCards(targetDateStr: string): Flashcard[] {
    return Array.from(this.localStore.values()).filter(c => {
      if (c.deleted) return false;
      return c.nextReviewDate <= targetDateStr;
    });
  }

  /**
   * Reconciles remote delta items with local store using Last-Write-Wins and Lamport versioning
   */
  public applyRemoteSyncDeltas(remoteCards: Flashcard[]): { updatedCount: number } {
    let updatedCount = 0;

    for (const remote of remoteCards) {
      const local = this.localStore.get(remote.id);
      if (!local || remote.version > local.version) {
        this.localStore.set(remote.id, remote);
        updatedCount += 1;
      }
    }

    return { updatedCount };
  }

  public getAllCards(): Flashcard[] {
    return Array.from(this.localStore.values());
  }
}
