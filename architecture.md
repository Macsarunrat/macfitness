# System Architecture: Personal Fitness & Nutrition Tracker

## 1. Project Overview
This project is a Personal Fitness & Nutrition Tracker designed as a decoupled system within a **Monorepo** structure. The system utilizes a PWA frontend for cross-platform accessibility and offline capabilities, communicating with a RESTful API backend.

## 2. Tech Stack Requirement
| Layer | Technology | Infrastructure / Deployment |
| :--- | :--- | :--- |
| **Frontend (PWA)** | React (Vite) + Tailwind CSS v3 | Vercel (Free Tier) |
| **Backend (API)** | Python + FastAPI + SQLModel | Render / Koyeb (Free Tier) |
| **Database** | PostgreSQL | Supabase / Neon (Free Tier) |
| **External APIs** | Gemini API (Multimodal), Strava/Google Fit API | N/A |

## 3. Monorepo Directory Structure
```text
├── apps/
│   ├── frontend/       # Vite + React PWA application
│   └── backend/        # FastAPI Python application
├── packages/           # Shared types or utilities if needed
├── .gitignore
├── architecture.md
└── README.md
```

## 4. Frontend Specifications (apps/frontend)
* **Framework:** Initialize a Vite project with React.
* **PWA Setup:** Integrate `vite-plugin-pwa`. Configure the `manifest.json` for proper installation and setup the Service Worker to handle offline caching and static asset management. Interface separation should be strictly implemented to ensure the UI remains responsive even during backend cold starts.
* **State Management & Fetching:** Use lightweight tools (e.g., Zustand or React Query) for managing UI states and API data caching.
* **Routing:** React Router for page navigation (Dashboard, Food Snap, Run Logs, Social).

## 5. Backend Specifications (apps/backend)
* **Framework:** Initialize a FastAPI project.
* **Authentication Flow:** Implement a secure JWT authentication system utilizing refresh tokens and permission-based access control to enforce strict data isolation among multi-user/couple accounts.
* **API Modules:**
    * `routers/auth.py`: Login, Register, Token management.
    * `routers/nutrition.py`: Multimodal data handling (sending base64 image strings to Gemini API, parsing JSON schema response).
    * `routers/running.py`: External API integration (Strava/Google Fit webhook or polling), Cadence & Fatigue matrix calculation.
    * `routers/social.py`: Notification and couple-sharing data retrieval.
* **Database ORM:** Use `SQLModel` for defining database schemas and interacting with the PostgreSQL database.

## 6. Database Schema (PostgreSQL)
Initialize the core models with the following relational logic:
* **Users:** ID, Email, HashedPassword, Role, Height, Weight, InjuryHistory, TargetProtein.
* **RunLogs:** ID, UserID, Date, Distance, Pace, HR, Cadence, FatigueScore (Calculated).
* **NutritionLogs:** ID, UserID, Date, ImageURL (Optional text/link), FoodName, ProteinAmount, Calories.
* **Connections:** ID, User1ID, User2ID, Status (For Couple Sharing).

## 7. Operational Requirements
* Ensure environment variables (`.env`) are strictly separated for both `frontend` and `backend` directories.
* Configure CORS in FastAPI to allow requests strictly from the Vercel deployment URL and local development ports.
