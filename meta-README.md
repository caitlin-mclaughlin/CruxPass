# CruxPass
Climbing competition app

## MVP
- [x] Gym + climber signup
  - [x] Edit profile info
  - [ ] Delete profile
- [x] Comp creation + registration
  - [x] Edit comp info
  - [ ] Delete comp
  - [ ] Delete registration
- [x] Upcoming competitions board (PUBLIC)
- [ ] Past competitions + leaderboard (PUBLIC)
- [ ] Score submission form
- [ ] Scoring & leaderboard computation
- [ ] Leaderboard design + filtering (PUBLIC)
  - [ ] Awards
  - [ ] Climber progress stats (green up arrow if rose in ranking)

- [ ] Basic mobile app for submission
 
## Core Features
Gyms (Admin Role)
- Create/manage gym account
- Create competitions (dates, categories, routes with point values)
- View/manage competitor registrations
- View submissions and results

Users (Competitors)
- Create account & manage profile
- Register for comps (with payment)
- Submit top 5 scores with attempts
  - 6 for tie breaks?
- View personal comp history & badges

Public / Website Visitors
- Comp results and rankings
  - overall and filtered
  - Regional leaderboards and cumulative scores
- Browse gyms & competitions
- Badge leaderboards
- Progress stats

## App Structure
Backend:
```
backend/
├── src/main/java/com/cruxpass/
│   ├── controllers/
│   ├── dtos/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── CruxPassApplication.java
├── src/main/resources/
│   └── application.yml
└── build.gradle
```
Frontend:
```
frontend/
├── public/
│   ├── pwa icons & manifest
├── src/
│   ├── assets/
│   ├── components/       # shared UI components (e.g., Button, Navbar)
│   ├── pages/            # screens/views (Home, Login, CompDetails)
│   ├── api/              # frontend API calls (fetch/axios)
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts        # Vite + PWA plugin
└── package.json
```
### Backend Models
```
User
- id, name, email, password, etc.
- profile, badges, competitionsParticipatedIn

Gym
- id, name, location, description, owner

Competition
- id, gym_id, name, date, routes, categories
- registrants, results, scoringConfig

Route
- id, competition_id, number, point_value

Submission
- id, user_id, competition_id
- List of submittedRouteScores (route_id, attempts, score)

LeaderboardEntry
- competition_id, user_id, score, placement

RegionalScore
- user_id, series, cumulative_score

Badge
- id, name, description, user_id, earned_at
```
## Model Relationships
``` mermaid
erDiagram
  USER ||--o{ REGISTRATION : uses
  REGISTRATION }o--|| COMPETITION : for
  REGISTRATION ||--|| SUBMISSION : contains
  SUBMISSION ||--|{ "SUBMITTED ROUTES" : contains
  GYM ||--o{ COMPETITION : hosts
```
### Tech Stack
- Frontend: React + TypeScript (with PWA setup)
- Backend: Spring Boot (you already use this 👍)
- Database: PostgreSQL (which you already use)
- Authentication: JWT (already in use, reuseable here)
- Payments: Stripe (for easy, secure registration payments)
- Hosting:
  - Frontend: Vercel, Netlify, or Firebase Hosting
  - Backend: Fly.io, Railway, or your preferred Spring Boot host
