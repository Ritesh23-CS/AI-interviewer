# 🤖 AI Interview Reviewer — Project Report
### *Presentation-Ready Study Document* | March 2026

---

## 1. Executive Summary

**AI Interview Reviewer** is a full-stack web application that simulates a job interview experience using AI. Users select a job role and difficulty level, answer 5 curated questions, and receive a detailed AI-generated performance report with scores, strengths, weaknesses, and a hiring recommendation.

> **Tagline:** *Practice. Improve. Get Hired.*

**Core Value Proposition:**
- Zero-cost question delivery (no API quota used for questions)
- Only **2 API calls per entire session** — highly efficient
- Personalized, role-specific feedback powered by GitHub Models (GPT-4o-mini)
- Supports **6 roles** × **3 difficulty levels** = **18 interview configurations**

---

## 2. Project Goals

| Goal | Status |
|---|---|
| Deliver 5 real interview questions per session | ✅ Done (local question bank) |
| Evaluate all answers in a single AI call | ✅ Done (batch evaluation) |
| Generate a personalized performance report | ✅ Done (AI report generator) |
| Eliminate unnecessary API calls | ✅ Done (static question bank) |
| Handle API rate limits gracefully | ✅ Done (fallback mock data) |
| Support multiple roles and difficulty levels | ✅ Done (6 roles × 3 levels) |

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.4 | UI framework |
| **Vite** | 8.0.1 | Build tool & dev server |
| **Tailwind CSS** | 4.2.2 | Utility-first styling |
| **React Router DOM** | 7.13.2 | Client-side navigation |
| **OpenAI SDK** | 6.33.0 | GitHub Models API client |
| **Lucide React** | 1.7.0 | Icon library |

### Backend *(Scaffolded — Not Active)*
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | ≥0.111.0 | Python web framework |
| **Uvicorn** | ≥0.30.1 | ASGI server |
| **Google Generative AI** | ≥0.5.4 | Gemini API client |
| **Pydantic** | ≥2.7.0 | Data validation |
| **python-dotenv** | ≥1.0.1 | Environment management |

### AI / API
- **GitHub Models API** (via Azure inference endpoint)
- Default model: `gpt-4o-mini` (free & fast)
- Also supports: `gpt-4o`, `meta-llama-3.1-70b-instruct`

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER (React App)                │
│                                                         │
│  HomeScreen → QuestionScreen → ReviewScreen → FinalReport│
│       │              │                          │       │
│   useSession      QuestionBank             FeedbackCard │
│   (global state)  (local static)           ScoreRing    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Services Layer                     │    │
│  │  geminiService.js   ← Core AI Client            │    │
│  │  answerEvaluator.js ← Batch Q&A Evaluation      │    │
│  │  reportGenerator.js ← Final Report Generation  │    │
│  │  questionGenerator.js ← Reads from question bank│    │
│  └──────────────────┬──────────────────────────────┘    │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTPS (2 calls/session)
                      ▼
        ┌─────────────────────────────┐
        │  GitHub Models / Azure AI   │
        │  (OpenAI-Compatible API)    │
        │  Model: gpt-4o-mini         │
        └─────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│   BACKEND (FastAPI — Scaffolded, Not Connected)          │
│   POST /api/evaluate-answer                              │
│   POST /api/generate-report                             │
│   (Uses Google Gemini API directly)                      │
└──────────────────────────────────────────────────────────┘
```

> **Key Architecture Decision:** The frontend calls the AI directly — the Python backend exists as a future migration target but is not wired to the frontend yet.

---

## 5. Application Flow

```
① Home Screen
   └─ User enters: Name, Role, Difficulty, Interview Type
   └─ Session initialized via useSession hook

② Question Screen (5 rounds)
   └─ Questions pulled from static local question bank (0 API calls)
   └─ User types/pastes their answer
   └─ Answer stored in session state (no immediate evaluation)

③ Review Screen
   └─ User reviews all 5 answers before finalizing

④ Evaluation (API Call #1)
   └─ All 5 Q&A pairs sent to GPT-4o-mini in a single batch prompt
   └─ Returns structured JSON with scores per category per question

⑤ Report Generation (API Call #2)
   └─ Full session data (Q&A + evaluations) sent to generate holistic report
   └─ Returns: overall score, category scores, strengths, improvements, hiring recommendation

⑥ Final Report Screen
   └─ Visual score dashboard + collapsible per-question feedback cards
```

**Total API calls per session: exactly 2**

---

## 6. Key Files Reference

### Frontend `/src`

| File | Role |
|---|---|
| [services/geminiService.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/services/geminiService.js) | Core AI client — handles requests, retries, rate limits & fallback mock data |
| [services/answerEvaluator.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/services/answerEvaluator.js) | Sends all 5 answers in one batch prompt; merges local checks |
| [services/reportGenerator.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/services/reportGenerator.js) | Sends full session data to generate final holistic report |
| [utils/questionBank.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/utils/questionBank.js) | 90 static questions (6 roles × 3 difficulty levels × 5 questions) |
| [utils/scoreCalculator.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/utils/scoreCalculator.js) | Aggregates per-question scores into session-level metrics |
| [utils/fillerWordDetector.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/utils/fillerWordDetector.js) | Detects filler words (um, uh, like, basically...) locally |
| [utils/wordCounter.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/utils/wordCounter.js) | Validates answer length before evaluation |
| [hooks/useSession.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/hooks/useSession.jsx) | Global React context — manages session state across all screens |
| [hooks/useDailyLimit.js](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/hooks/useDailyLimit.js) | Tracks daily usage (hardcoded to `false` during development) |
| [components/HomeScreen.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/HomeScreen.jsx) | Entry form (name, role, difficulty, type) |
| [components/QuestionScreen.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/QuestionScreen.jsx) | 5-question interview flow |
| [components/ReviewScreen.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/ReviewScreen.jsx) | Review all answers before submitting |
| [components/FinalReport.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/FinalReport.jsx) | Score dashboard + collapsible feedback cards |
| [components/FeedbackCard.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/FeedbackCard.jsx) | Per-question strengths/weaknesses/better-answer display |
| [components/ScoreRing.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/ScoreRing.jsx) | Animated circular score ring component |
| [components/ProgressBar.jsx](file:///c:/Users/RITESH/OneDrive/Desktop/AI%20interviewer/frontend/src/components/ProgressBar.jsx) | Progress indicator across 5 questions |

### Backend `/backend`

| File | Role |
|---|---|
| `main.py` | FastAPI app entry — CORS configured for Vite dev ports |
| `routes/interview.py` | `POST /api/evaluate-answer` endpoint |
| `routes/report.py` | `POST /api/generate-report` endpoint |
| `services/gemini_service.py` | Server-side Gemini API client |

---

## 7. Supported Roles & Questions

| Role | Beginner | Intermediate | Advanced | Total Questions |
|---|---|---|---|---|
| Software Engineer | ✅ | ✅ | ✅ | 15 |
| Product Manager | ✅ | ✅ | ✅ | 15 |
| Data Analyst | ✅ | ✅ | ✅ | 15 |
| Marketing | ✅ | ✅ | ✅ | 15 |
| HR | ✅ | ✅ | ✅ | 15 |
| Business Analyst | ✅ | ✅ | ✅ | 15 |
| **Total** | | | | **90 questions** |

Questions are **randomly shuffled** each session so repeat users get a fresh experience from the same pool.

---

## 8. Scoring System

Each answer is evaluated on **5 categories (1–10 each)**:

| Category | What It Measures |
|---|---|
| **Communication** | Clarity and articulation of ideas |
| **Technical Knowledge** | Accuracy and depth of domain knowledge |
| **Clarity & Structure** | Logical organization of the response |
| **Confidence Indicators** | Assertive, direct language; no hedging |
| **Relevance** | How on-topic the answer is to the question |

**Verdict tiers:**
- 🟢 **Good / Excellent** — Score 8–10
- 🟡 **Needs Improvement** — Score 5–7
- 🔴 **Poor** — Score 1–4

The `scoreCalculator.js` utility aggregates all per-question scores into a session-level summary (average per category + overall score + answer tier counts).

**Final Report Output:**
- `overall_score` — integer 1–100
- `category_scores` — per-dimension ratings (1–10)
- `top_strengths` — 3 personalized strengths
- `areas_to_improve` — 3 specific improvements
- `overall_summary` — 3–4 sentence candidate assessment
- `hiring_recommendation` — Strong Yes / Yes / Maybe / No
- `recommended_resources` — Study topics with reasons

---

## 9. AI Integration Details

### The AI Client: `geminiService.js`

```js
// GitHub Models uses an OpenAI-compatible endpoint via Azure
const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: githubToken,
  dangerouslyAllowBrowser: true,
});
```

**Resilience Features:**
- ✅ 1 automatic retry on transient failures (except rate limits)
- ✅ 429 rate limit detection — shows user-friendly message, no retry
- ✅ Offline detection before making any request
- ✅ Fallback mock data for all JSON calls — app never crashes
- ✅ JSON response forced via `response_format: { type: 'json_object' }`
- ✅ 1.5s minimum UX delay (runs in parallel with the API call)
- ✅ Markdown fence stripping for malformed JSON responses

### Batch Evaluation Prompt Structure

All 5 answers are sent in **one prompt** returning an array of 5 evaluation objects — this is the critical optimization that reduces API calls from 5 → 1.

### Local Pre-Processing (Zero API Cost)
- **Filler word detection** — scans for "um", "uh", "like", "basically", etc.
- **Word count validation** — rejects answers that are too short before even calling the API

---

## 10. State Management

`useSession.jsx` implements a React Context that holds the entire interview session:

```
Session State:
├── name, role, difficulty, interviewType (set at start)
├── startTime / endTime (timestamps)
├── qaPairs[] → { question, answer }   (built during interview)
└── evaluations[] → { scores, verdict, ... } (set after batch AI call)
```

Key methods:
- `startSession(config)` — initializes a new session
- `addAnswer(question, answer)` — appends each Q&A pair
- `setBatchEvaluations(evaluations)` — merges AI results into qaPairs
- `endSession()` — sets endTime for duration calculation

---

## 11. Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| Static question bank | Eliminates API quota usage for questions, zero cost | Questions are fixed (not dynamically personalized) |
| Frontend-direct AI calls | Simpler architecture, no backend dependency | API key exposed in browser (needs GitHub PAT only, low risk) |
| Batch evaluation (1 call for 5 answers) | 5× reduction in API calls vs. per-question evaluation | Slightly larger prompt, but well within token limits |
| GPT-4o-mini via GitHub Models | Free tier availability, fast responses | Subject to GitHub Models rate limits |
| React Context for state | Simple, no Redux overhead | State lost on page refresh |
| Daily limit (disabled) | Future monetization hook | Currently set to `false` in development |

---

## 12. Setup & Running Locally

### Frontend
```bash
cd frontend
npm install
# Create .env with VITE_GITHUB_TOKEN=<your_github_pat>
npm run dev
# Opens at http://localhost:5173
```

**Getting a GitHub PAT:** Go to github.com/settings/tokens → Generate new token (classic) → No special scopes needed.

### Backend (Optional — Not Connected)
```bash
cd backend
pip install -r requirements.txt
# Add GEMINI_API_KEY to backend/.env
uvicorn main:app --reload
# Runs at http://localhost:8000
```

---

## 13. Current Limitations

| Limitation | Notes |
|---|---|
| API Key in browser | GitHub PAT required; low-permission token, acceptable risk |
| Static questions only | 90 total questions; no AI-generated personalization |
| No user accounts | Session state is ephemeral (lost on refresh) |
| Backend not connected | FastAPI exists but frontend doesn't use it |
| Daily limit disabled | `useDailyLimit.js` hardcoded to `false` |
| No voice input | Text-only answers |
| No audio/video simulation | No real-time interview pressure simulation |

---

## 14. Future Roadmap

```
Phase 1 (Current) ─── Static questions + Batch AI evaluation + Report ✅
Phase 2 ─────────────── Connect Python backend, move API keys server-side
Phase 3 ─────────────── User accounts + session history + progress tracking
Phase 4 ─────────────── Voice input (Speech-to-Text) + live filler detection
Phase 5 ─────────────── AI-generated adaptive questions based on past answers
Phase 6 ─────────────── Company-specific interview packs + subscription model
```

---

## 15. Key Metrics at a Glance

| Metric | Value |
|---|---|
| Total questions in bank | 90 |
| Job roles supported | 6 |
| Difficulty levels | 3 |
| Questions per session | 5 |
| API calls per session | **2** |
| Evaluation categories | 5 |
| Frontend components | 8 |
| Frontend services | 4 |
| Utility modules | 4 |
| React hooks | 2 |

---

*Report generated on 27 March 2026 — Based on full source code analysis of the AI Interview Reviewer project.*
