# Personal Fitness & Nutrition Tracker (Monorepo)

A fitness and nutrition tracker designed for couples or individuals, featuring a beautiful, cute pink-pastel, minimalist UI. 

## Structure
- `apps/frontend`: Vite + React + Tailwind CSS v3 PWA.
- `apps/backend`: FastAPI + Python + SQLModel REST API.

## Local Setup

### Frontend Setup
1. Navigate to the frontend app:
   ```bash
   cd apps/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend app:
   ```bash
   cd apps/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   uvicorn main:app --reload
   ```
