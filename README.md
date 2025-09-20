# CruxPass
Climbing competition app

## MVP
- [x] Gym signup + comp creation
- [x] User signup + registration
- [x] Series signup + registration
 - [ ] Link competitions to series
 - [ ] Link climbers to series
- [ ] Parent account with management of multiple climbers (for under 13)
- [ ] Judge account for different comp styles
- [x] Score submission form
- [ ] Scoring & leaderboard computation
- [ ] Basic mobile app for submission
- [ ] Public leaderboard on web
 
## Core Features
Gyms (Admin Role)
- Create/manage gym account
- Create competitions (name, date, duration, registration deadline, format, divisions. groups, routes with point values)
- View/manage comp details, competitor registrations, and routes
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
│   ├── config/
│   ├── controllers/
│   ├── dtos/
│   ├── enums/
│   ├── exceptions/
│   ├── mappers/
│   ├── models/
│   ├── repositories/
│   ├── security/
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
│   ├── components/ 
│       ├── modals/
│       ├── ui/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── models/
│   ├── pages
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts        # Vite + PWA plugin
└── package.json
```
### Backend Models
```
climber
- id, name, email, password, etc.
- profile, badges, competitionsParticipatedIn

Gym
- id, name, location, etc.

Competition
- id, gym_id, name, date, routes, groups,divisions, scoring formats
- registrants, results, scoringConfig

Route
- id, competition_id, number, point_value

Submission
- id, user_id, competition_id, submittedRoutes
- List of submittedRouteScores (route_id, attempts, score)

LeaderboardEntry
- competition_id, user_id, score, placement

RegionalScore
- user_id, region, cumulative_score

Badge
- id, name, description, user_id, earned_at
```
## Model Relationshipe
``` mermaid
graph LR;
  User-->Registration;
  Registration-->Competition;
  Registration-->Submission;
  Submission-->\[Submiited Routes];
  Gym-->Competition;
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
