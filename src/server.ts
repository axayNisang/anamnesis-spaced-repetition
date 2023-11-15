import express, { Request, Response } from 'express';
import { SuperMemo2Engine } from './algorithm/SuperMemo2Engine';
import { CrossDeviceSyncEngine } from './sync/CrossDeviceSyncEngine';
import { Flashcard, ReviewGrade } from './types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());

const syncEngine = new CrossDeviceSyncEngine();

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'anamnesis-spaced-repetition' }));

app.post('/api/cards', (req: Request, res: Response) => {
  const { frontMarkdown, backMarkdown, deckId } = req.body;
  const card: Flashcard = {
    id: `card_${uuidv4().replace(/-/g, '').slice(0, 8)}`,
    deckId: deckId || 'deck_default',
    frontMarkdown,
    backMarkdown,
    repetitions: 0,
    intervalDays: 0,
    easinessFactor: 2.5,
    nextReviewDate: new Date().toISOString().split('T')[0],
    version: 1,
    deleted: false,
    updatedAt: new Date().toISOString()
  };
  syncEngine.upsertLocal(card);
  return res.status(201).json(card);
});

app.post('/api/cards/:id/review', (req: Request, res: Response) => {
  const cards = syncEngine.getAllCards();
  const card = cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const grade = Number(req.body.grade) as ReviewGrade;
  if (isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(400).json({ error: 'Grade must be an integer between 0 and 5' });
  }

  const updated = SuperMemo2Engine.processReview(card, grade);
  syncEngine.upsertLocal(updated);
  return res.json(updated);
});

app.get('/api/cards/due', (req, res) => {
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const due = syncEngine.getDueCards(targetDate);
  return res.json({ targetDate, count: due.length, cards: due });
});

const PORT = 8090;
app.listen(PORT, () => console.log(`[Anamnesis SM-2] Running on port ${PORT}`));
