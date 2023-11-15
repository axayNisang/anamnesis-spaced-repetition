# Senior Manual QA Test Report: Anamnesis SM-2 Adaptive Spaced Repetition Engine

**Role:** Senior Manual QA Tester / Algorithm & Distributed Sync Reviewer  
**Target Service:** `anamnesis-spaced-repetition`  
**Protocol:** REST API over HTTP  
**Port:** 8090  
**Test Date:** 2026-11-25  
**Overall Verdict:** PASSED (SM-2 mathematical recalculations, memory-lapse resets, and due card queries verified)

---

## 1. Scope & Test Objectives
As a Senior QA Tester, I conducted full manual testing on `anamnesis-spaced-repetition`. This service implements the SuperMemo SM-2 algorithm to schedule cognitive review intervals based on user recall grades.

Mathematical specification under test:
- **Easiness Factor (EF):** $EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$, with a hard floor of $1.3$.
- **Interval Formula:**
  - Repetition 1: $I(1) = 1$ day
  - Repetition 2: $I(2) = 6$ days
  - Repetition $n \ge 3$: $I(n) = I(n - 1) \times EF$
- **Memory Lapse (Grade < 3):** Repetitions reset to $0$, interval resets to $1$ day, $EF$ penalized.

---

## 2. Live Step-by-Step Execution & Results

### Step 1: Healthcheck
- **Command:**
```bash
curl -i -X GET http://localhost:8090/health
```
- **Live Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"UP","service":"anamnesis-spaced-repetition"}
```
- **Verdict:** PASSED.

---

### Step 2: Create Technical Flashcard
- **Description:** Initializes a flashcard on Byzantine Generals Problem.
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards \
  -H 'Content-Type: application/json' \
  -d '{
    "frontMarkdown": "What is the Byzantine Generals Problem in distributed computing?",
    "backMarkdown": "The consensus challenge where actors must agree on a strategy amidst unreliable communication and malicious nodes.",
    "deckId": "deck_dist_systems"
  }'
```
- **Live Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": "card_f709b82b",
  "deckId": "deck_dist_systems",
  "frontMarkdown": "What is the Byzantine Generals Problem in distributed computing?",
  "repetitions": 0,
  "intervalDays": 0,
  "easinessFactor": 2.5,
  "nextReviewDate": "2026-11-25",
  "version": 1
}
```
- **Verdict:** PASSED. Default EF of 2.5 and repetitions = 0 initialized.

---

### Step 3: Review Grade 5 (Perfect Recall)
- **Description:** User reviews card and scores 5/5.
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards/card_f709b82b/review \
  -H 'Content-Type: application/json' \
  -d '{"grade": 5}'
```
- **Live Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "id": "card_f709b82b",
  "repetitions": 1,
  "intervalDays": 1,
  "easinessFactor": 2.6,
  "nextReviewDate": "2026-11-26",
  "version": 2
}
```
- **Verdict:** PASSED. Repetition incremented to 1; interval set to 1 day; EF updated to 2.6.

---

### Step 4: Review Grade 4 (Good Recall)
- **Description:** Subsequent review with Grade 4.
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards/card_f709b82b/review \
  -H 'Content-Type: application/json' \
  -d '{"grade": 4}'
```
- **Live Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "id": "card_f709b82b",
  "repetitions": 2,
  "intervalDays": 6,
  "easinessFactor": 2.6,
  "nextReviewDate": "2026-12-01",
  "version": 3
}
```
- **Verdict:** PASSED. Repetition 2 advances interval to 6 days according to SM-2 formula.

---

### Step 5: Review Grade 5 (Long-Term Retention)
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards/card_f709b82b/review \
  -H 'Content-Type: application/json' \
  -d '{"grade": 5}'
```
- **Live Response:**
```http
HTTP/1.1 200 OK

{
  "id": "card_f709b82b",
  "repetitions": 3,
  "intervalDays": 16,
  "easinessFactor": 2.7,
  "nextReviewDate": "2026-12-11",
  "version": 4
}
```
- **Verdict:** PASSED. $6 \times 2.6 = 15.6 \rightarrow 16$ days.

---

### Step 6: [Edge Case] Memory Lapse (Grade 1 - Forgetting)
- **Description:** User completely fails recall. SM-2 dictates resetting repetition streak and collapsing interval.
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards/card_f709b82b/review \
  -H 'Content-Type: application/json' \
  -d '{"grade": 1}'
```
- **Live Response:**
```http
HTTP/1.1 200 OK

{
  "id": "card_f709b82b",
  "repetitions": 0,
  "intervalDays": 1,
  "easinessFactor": 2.16,
  "nextReviewDate": "2026-11-26",
  "version": 5
}
```
- **Verdict:** PASSED. Streak reset to 0, interval reset to 1 day, and EF heavily penalized from 2.7 to 2.16.

---

### Step 7: [Edge Case] Invalid Grade Rejection
- **Command:**
```bash
curl -i -X POST http://localhost:8090/api/cards/card_f709b82b/review \
  -H 'Content-Type: application/json' \
  -d '{"grade": 9}'
```
- **Live Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"error":"Grade must be an integer between 0 and 5"}
```
- **Verdict:** PASSED. Invalid input cleanly rejected with HTTP 400.
