# Vocabulary Quiz App

Angol-magyar szótanulást segítő kvíz alkalmazás, intelligens prioritás-alapú szókisorsolással. A 3000 szavas szótárból mindig azok a szavak jelennek meg gyakrabban, amelyeket még nem tanultál meg jól.

---

## Tartalomjegyzék

- [Funkciók](#funkciók)
- [Technológiai stack](#technológiai-stack)
- [Projektstruktúra](#projektstruktúra)
- [Telepítés és indítás](#telepítés-és-indítás)
- [Parancsok összefoglalója](#parancsok-összefoglalója)
- [Prioritás logika](#prioritás-logika)
- [API dokumentáció](#api-dokumentáció)

---

## Funkciók

- **Kvíz mód:** Megjelenik egy szó, te beírod a fordítást, az app azonnal kiértékeli
- **Irányválasztó:** Fordíthatsz angolról magyarra, magyarról angolra, vagy véletlenszerűen mindkettő
- **Prioritás-alapú kisorsolás:** Amit ritkán találsz el, azt sűrűbben kapod — amit már jól tudsz, azt ritkábban
- **Visszajelzés:** Helyes/helytelen visszajelzés 1,5 másodpercig, utána automatikusan jön a következő szó
- **Statisztika nézet:** Összesítés (elsajátított / tanuláson / nehéz) + rendezható szótáblázat minden szóra

---

## Technológiai stack

| Réteg | Technológia |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Node.js + Express + TypeScript |
| Adatbázis | SQLite (Prisma v7 + libsql adapter) |
| Adat forrás | `vocabulary.xlsx` (3000 angol-magyar szópár) |

---

## Projektstruktúra

```
vocabularyAPP/
├── package.json              # Root: dev script (concurrently)
├── vocabulary.xlsx           # Forrás szótár (3000 szópár)
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  # DATABASE_URL=file:./dev.db
│   ├── dev.db                # SQLite adatbázis (generált)
│   ├── prisma/
│   │   ├── schema.prisma     # Adatbázis séma
│   │   └── migrations/       # Migrációk
│   ├── generated/
│   │   └── prisma/           # Generált Prisma kliens
│   ├── src/
│   │   ├── index.ts          # Express szerver belépési pont
│   │   ├── db.ts             # Prisma singleton
│   │   ├── routes/
│   │   │   ├── quiz.ts       # GET /api/quiz/next, POST /api/quiz/answer
│   │   │   └── stats.ts      # GET /api/stats, GET /api/stats/words
│   │   └── lib/
│   │       └── weightedRandom.ts  # Prioritás-alapú véletlenszerű kiválasztás
│   └── scripts/
│       └── importVocabulary.ts    # Egyszeri xlsx → SQLite import
│
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts        # /api proxy → localhost:3001
    └── src/
        ├── App.tsx           # Navigáció (Kvíz / Statisztika)
        ├── api.ts            # Typed fetch wrapper függvények
        ├── hooks/
        │   └── useQuiz.ts    # Kvíz state machine hook
        └── components/
            ├── QuizCard.tsx          # Fő kvíz felület
            ├── FeedbackBanner.tsx    # Helyes/helytelen visszajelzés
            ├── DirectionSelector.tsx # Irányválasztó gombsor
            └── StatsPanel.tsx        # Statisztika és szótáblázat
```

---

## Telepítés és indítás

### Előfeltételek

- **Node.js** v18 vagy újabb
- **npm** v9 vagy újabb

### 1. Függőségek telepítése

A root mappában:

```bash
npm install
```

A server mappában:

```bash
cd server
npm install
```

A client mappában:

```bash
cd client
npm install
```

### 2. Adatbázis és szótár betöltése

Az adatbázist már inicializálva tartalmazza a repó (a migrációk lefutottak). Ha mégis nulláról szeretnéd újraépíteni:

```bash
cd server

# Adatbázis séma alkalmazása
npx prisma migrate dev --name init

# 3000 szó importálása az xlsx fájlból az adatbázisba
npm run import
```

> Az import script idempotens: többször is futtatható, nem hoz létre duplikált rekordokat.

### 3. Alkalmazás indítása

A **root mappából** egyetlen paranccsal indítható mindkét szerver:

```bash
npm run dev
```

Ez párhuzamosan elindítja:
- **Backend** → `http://localhost:3001`
- **Frontend** → `http://localhost:5173`

Nyisd meg a böngészőben: **http://localhost:5173**

---

## Parancsok összefoglalója

### Root (vocabularyAPP/)

| Parancs | Leírás |
|---|---|
| `npm run dev` | Backend + frontend egyszerre (ajánlott) |
| `npm run import` | Szótár újraimportálása xlsx-ből |

### Server (vocabularyAPP/server/)

| Parancs | Leírás |
|---|---|
| `npm run dev` | Csak a backend szerver indítása |
| `npm run import` | Szótár importálása az adatbázisba |
| `npm run build` | TypeScript fordítás (dist/ mappa) |
| `npx prisma studio` | Vizuális adatbázis böngésző (böngészőben) |
| `npx prisma migrate dev` | Sémaváltozások alkalmazása |

### Client (vocabularyAPP/client/)

| Parancs | Leírás |
|---|---|
| `npm run dev` | Csak a frontend dev szerver indítása |
| `npm run build` | Production build (dist/ mappa) |
| `npm run preview` | Production build előnézete |

---

## Prioritás logika

Minden szó egy **1–20 közötti prioritás értékkel** rendelkezik. Kezdetben minden szó prioritása **10**.

### Prioritás változása válasz után

| Esemény | Változás | Határérték |
|---|---|---|
| Helyes válasz | `priority - 1` | minimum 1 |
| Helytelen válasz | `priority + 2` | maximum 20 |

A szándékos aszimmetria (−1 vs +2) azt eredményezi, hogy a nehéz szavak gyorsabban kerülnek vissza, mint ahogy az ismertek eltűnnek.

### Súlyozott véletlenszerű kisorsolás

A következő szó kisorsolásakor minden szó valószínűsége arányos a prioritásával:

- Egy **10-es prioritású** szó tízszer valószínűbb, mint egy **1-es prioritású**
- Egy **20-as prioritású** szó kétszer valószínűbb, mint egy **10-es prioritású**

Az algoritmus (prefix-sum + bináris keresés) 3000 szóra < 1 ms alatt fut.

### Prioritás kategóriák a statisztikában

| Kategória | Prioritás tartomány | Jelentés |
|---|---|---|
| Elsajátított | 1–3 | Jól tudod, ritkán kerül elő |
| Tanulás alatt | 4–14 | Folyamatban |
| Nehéz | 15–20 | Sokszor tévesztett, sűrűn jelenik meg |

---

## API dokumentáció

### `GET /api/quiz/next`

Visszaad egy prioritás-alapon kisorsolt következő szót.

**Query paraméterek:**

| Paraméter | Értékek | Alapértelmezett |
|---|---|---|
| `direction` | `en-hu` \| `hu-en` \| `both` | `both` |

**Válasz:**

```json
{
  "wordId": 842,
  "prompt": "easily",
  "direction": "en-hu",
  "priority": 10
}
```

---

### `POST /api/quiz/answer`

Kiértékeli a választ és frissíti a szó prioritását.

**Request body:**

```json
{
  "wordId": 842,
  "answer": "könnyen",
  "direction": "en-hu"
}
```

**Válasz:**

```json
{
  "correct": true,
  "correctAnswer": "könnyen",
  "newPriority": 9,
  "correctCount": 1,
  "wrongCount": 0
}
```

---

### `GET /api/stats`

Összesített statisztika az összes szóra.

**Válasz:**

```json
{
  "totalWords": 3000,
  "mastered": 12,
  "learning": 2981,
  "difficult": 7,
  "avgPriority": 9.8
}
```

---

### `GET /api/stats/words`

Lapozható, rendezhető szólista.

**Query paraméterek:**

| Paraméter | Leírás | Alapértelmezett |
|---|---|---|
| `page` | Oldalszám | `1` |
| `limit` | Szavak száma oldalanként (max 100) | `50` |
| `sort` | `priority` \| `correctCount` \| `wrongCount` \| `english` \| `hungarian` | `priority` |
| `order` | `asc` \| `desc` | `desc` |

**Válasz:**

```json
{
  "words": [
    {
      "id": 1,
      "english": "a",
      "hungarian": "egy",
      "priority": 7,
      "correctCount": 3,
      "wrongCount": 0,
      "lastSeenAt": "2026-03-20T09:00:00.000Z"
    }
  ],
  "total": 3000,
  "page": 1,
  "limit": 50
}
```
