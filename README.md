# Anamnesis — Spaced Repetition Engine (SuperMemo SM-2) 🧠

[![CI Pipeline](https://github.com/axayNisang/anamnesis-spaced-repetition/actions/workflows/ci.yml/badge.svg)](https://github.com/axayNisang/anamnesis-spaced-repetition/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![SuperMemo SM-2](https://img.shields.io/badge/Algorithm-SuperMemo%20SM--2-purple.svg)](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020-green.svg)](https://nodejs.org)

**Anamnesis** is an adaptive cognitive spaced-repetition scheduling engine implementing the SuperMemo SM-2 algorithm with distributed cross-device conflict-free sync delta resolution.

---

## 🏛 The SuperMemo SM-2 Algorithm & Mathematical Formulation

The SM-2 algorithm dynamically calculates the optimal interval for reviewing memory items to maximize long-term retention while minimizing review volume:

$$EF' = \max\left(1.3, \; EF + \left(0.1 - (5 - q) 	imes \left(0.08 + (5 - q) 	imes 0.02ight)ight)ight)$$

$$I(n) = egin{cases} 
1 & 	ext{for } n = 1 \
6 & 	ext{for } n = 2 \
	ext{round}(I(n-1) 	imes EF) & 	ext{for } n > 2 
\end{cases}$$

Where:
- $q \in \{0, 1, 2, 3, 4, 5\}$: User recall quality grade (0 = complete blackout, 5 = perfect recall).
- $EF$: Easiness factor (default 2.5, minimum floor 1.3).
- $I(n)$: Calculated review interval in days.

---

## 🌟 Key Engineering Features

- **Dynamic Review Intervals**: Automatically computes future review dates tailored to the user's difficulty history on each flashcard.
- **Recall Penalty & Chain Reset**: Recall failures ($q < 3$) automatically reset the repetition counter and return the card to the 1-day review queue.
- **Cross-Device Sync Protocol**: Deterministic conflict resolution using Lamport versions and soft-delete tombstones across offline-first mobile and desktop clients.

---

## 🧪 Testing

```bash
npm install
npm test
```

---

## 📄 License
MIT License. Created by [Akshay Nisang](https://github.com/axayNisang).
