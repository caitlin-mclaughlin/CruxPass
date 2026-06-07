# CruxPass
Climbing competition app

## MVP
- [x] Gym 
  - [x] Signup
  - [x] Create competitions (IN PROGRESS)
  - [ ] Manage competition registrations
    - [x] Register climbers for competitions
    - [x] Delete / change registrations
    - [ ] NEEDS TO BE UPDATED
  - [ ] Manage competition submissions
  - [ ] Create custom competitor groups with optional age restrictions (IN PROGRESS)
- [x] Climber 
  - [x] Signup
  - [x] Parent account with management of multiple climbers (for under 13) ("dependents")
  - [x] Register for competitions / series (no payment right now)
- [x] Series 
  - [x] Signup
  - [x] Link competitions to series
  - [x] Link climbers to series (bidirectional)
  - [x] Link gyms to series (bidirectional)
  - [ ] Create custom competitor groups with optional age restrictions (IN PROGRESS)
- [ ] Judge account for different comp styles
- [ ] Registration payment via Stripe
- [x] Score submission form
  - [ ] NEEDS TO BE UPDATED
- [x] Scoring & leaderboard computation
  - [ ] NEEDS TO BE UPDATED
- [ ] Basic mobile app for submission
- [x] Public leaderboard on web
  - [ ] NEEDS TO BE UPDATED
 
## Core Features
Gyms (Admin Role)
- Create/manage gym account
- Create competitions (name, date, duration, registration deadline, format, divisions. groups, routes with point values)
- View/manage comp details, competitor registrations, and routes
- View submissions and results

Users (Competitors)
- Create account & manage profile
- Register for comps (with payment)
- Register for series (with payment)
- Submit top 5 scores with attempts
  - 6 for tie breaks?
- View personal comp history & badges

Series (Role)
- Create/manage series account
- Define series details (name, start / end dates, registration deadline, groups)
- Link gyms and competitions to series (bidirectional)
- View/manage details, competitions, registrations, and comp results

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
│   ├── annotations/
│   ├── config/
│   ├── controllers/
│   ├── dtos/
│   ├── enums/
│   ├── events/
│   ├── exceptions/
│   ├── mappers/
│   ├── models/
│   ├── repositories/
│   ├── resolvers/
│   ├── security/
│   ├── services/
│   ├── utils/
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
│   ├── components/ 
│       ├── forms/
│       ├── modals/
│       ├── ui/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── models/
│   ├── pages
│       ├── profiles/
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
- Backend: Spring Boot
- Database: PostgreSQL
- Authentication: JWT
- Payments: Stripe (for easy, secure registration payments)
- Hosting:
  - Frontend: Vercel, Netlify, or Firebase Hosting
  - Backend: Fly.io, Railway, or your preferred Spring Boot host
