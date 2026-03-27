# MockMaster

An AI-powered mock interview web app. Answer 5 questions, get batch AI evaluation, and receive a personalised performance report.

## Project Structure

```
AI interviewer/
├── frontend/          ← React + Vite + Tailwind CSS (actively used)
└── backend/           ← Python FastAPI (scaffolded, not connected yet)
```

> **Current Architecture:** The frontend calls the AI directly via GitHub Models API. The Python backend exists but is not yet wired up.

---

## 🚀 Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment
Create / update `frontend/.env`:
```env
VITE_GITHUB_TOKEN=ghp_your_github_pat_here
VITE_GITHUB_MODEL=gpt-4o-mini
```

**Getting a GitHub PAT:**
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. No scopes needed — just generate and copy

**Other supported models:**
| Model | Notes |
|---|---|
| `gpt-4o-mini` | ✅ Recommended — fast & free |
| `gpt-4o` | More capable, slower |
| `meta-llama-3.1-70b-instruct` | Open source alternative |

### 3. Start the dev server
```bash
npm run dev
```
Open: `http://localhost:5173`

---

## 🎯 How It Works

```
Home Screen → 5 Questions (local bank, zero API calls)
                    ↓
        "Finish Interview" button
                    ↓
     Batch evaluate all 5 answers (1 API call)
                    ↓
     Generate final report (1 API call)
                    ↓
           Final Report Screen
```

**Total API calls per session: 2**

---

## 📁 Key Frontend Files

| File | Purpose |
|---|---|
| `src/services/geminiService.js` | Core AI client (GitHub Models via OpenAI SDK) |
| `src/services/answerEvaluator.js` | Batch evaluates all answers in one call |
| `src/services/reportGenerator.js` | Generates the final performance report |
| `src/utils/questionBank.js` | 90 static questions (6 roles × 3 difficulties × 5) |
| `src/hooks/useSession.jsx` | Global session state (answers, evaluations, metadata) |
| `src/components/QuestionScreen.jsx` | 5-question interview flow |
| `src/components/FinalReport.jsx` | Collapsible feedback + score dashboard |

---

## 🧠 Supported Roles & Difficulties

| Role | Beginner | Intermediate | Advanced |
|---|---|---|---|
| Software Engineer | ✅ | ✅ | ✅ |
| Product Manager | ✅ | ✅ | ✅ |
| Data Analyst | ✅ | ✅ | ✅ |
| Marketing | ✅ | ✅ | ✅ |
| HR | ✅ | ✅ | ✅ |
| Business Analyst | ✅ | ✅ | ✅ |

---

## 🐍 Backend (Not Active)

The backend folder is scaffolded but not connected to the frontend.

```bash
cd backend
pip install -r requirements.txt
# Add GEMINI_API_KEY to backend/.env
uvicorn main:app --reload
```

Available endpoints (when running):
- `POST /api/evaluate-answer`
- `POST /api/generate-report`

---

## ⚠️ Notes

- Daily limit feature is **disabled** during development (`useDailyLimit.js` hardcoded to `false`)
- If the API returns a 429 (rate limit), the app falls back to **mock evaluation data** automatically
- Questions are served from a local static bank — no API quota used for question generation
