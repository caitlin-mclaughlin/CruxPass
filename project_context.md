# CruxPass — Project Context & Architecture Handoff

This document is intended to be used as a **context handoff** when starting new AI chats or onboarding collaborators. It summarizes the current architecture, domain model, and active development focus.

---

## 🧗 App Overview

**CruxPass** is a climbing competition platform that supports:
- Gyms running competitions
- Series organizing multi‑competition events
- Climbers registering and submitting scores

### Roles (Account Types)
- **GYM** — competition hosts
- **SERIES** — organizers across gyms
- **CLIMBER** — competitors (with dependent accounts for youth)

Authentication uses **JWT** with claims:
- `role`: GYM | SERIES | CLIMBER
- `id`: entity id

Backend uses argument resolvers:
- `@CurrentGym`
- `@CurrentSeries`
- `@CurrentClimber`

---

## ✅ MVP Progress

### Gym
- ✅ Signup
- 🚧 Create competitions (major refactor in progress)
- 🚧 Manage competitor groups (custom + default)
- 🚧 Manage registrations (needs update)
- ⏳ Manage submissions

### Climber
- ✅ Signup
- ✅ Parent accounts + dependents
- ✅ Register for competitions / series

### Series
- ✅ Signup
- ✅ Link gyms, competitions, climbers
- 🚧 Custom competitor groups

### Scoring
- ✅ Submission form
- 🚧 Leaderboard computation needs update

### Planned
- Stripe payments
- Judge accounts
- Mobile submission app

---

## 🧠 Core Domain Concepts

### Competitor Groups (Critical)

There are **two types** of competitor groups:

### 1. Default Groups (NOT stored in DB)

Enum:
```
REC, INTERMEDIATE, ADVANCED, OPEN,
YOUTH_D, YOUTH_C, YOUTH_B, YOUTH_A, JUNIOR
```

Each has static metadata:
- label
- optional age rule (AGE min/max)

These are defined in code only.

### 2. Custom Groups (Stored in DB)

Entity:
```java
@Entity
class CompetitorGroup {
  Long id;
  OwnerType ownerType; // GYM or SERIES
  Long ownerId;
  String name;
  boolean isConstrained;
  @Embedded AgeRule ageRule;
}
```

Used when gyms or series define custom divisions.

---

## 🔗 GroupRef Design (Frontend + API)

All competitions and heats reference groups using **polymorphic refs**:

```java
sealed interface GroupRef
  DefaultGroupRef(DefaultCompetitorGroup key)
  CustomGroupRef(Long id)
```

DTOs and frontend use this structure directly.

### Persistence

Entities store refs using an embeddable:

```java
@Embeddable
class GroupRefEmbeddable {
  GroupRefType type; // DEFAULT | CUSTOM
  DefaultCompetitorGroup defaultKey;
  Long customGroupId;
}
```

Mappers convert between `GroupRef` ⇄ `GroupRefEmbeddable`.

### Resolution

Backend service resolves refs into display data:

```java
ResolvedCompetitorGroup {
  Long id; // null for default
  String label;
  AgeRule ageRule;
}
```

Ownership validation occurs when resolving custom refs.

---

## 🏆 Competition Aggregate

Competition is the **aggregate root**.

```java
Competition
  id
  name
  startDate
  deadline
  types
  compFormat
  selectedGroups (Set<GroupRefEmbeddable>)
  heats (List<Heat>)
  gym or series owner
  routes
  registrations
```

### Heat (Entity)

```java
Heat
  id
  startTime
  capacity
  duration
  groups (List<GroupRefEmbeddable>)
  divisions
  divisionsEnabled
```

Heats are owned by Competition with:

```java
@OneToMany(mappedBy = "competition", cascade = ALL, orphanRemoval = true)
```

---

## 🔄 Heat Sync Strategy

Frontend sends `HeatDto` with **optional id**:

- `id present` → update existing heat
- `id missing` → create new heat
- existing DB heat missing from payload → delete (via orphanRemoval)

Backend update flow:
1. Map existing heats by id
2. Iterate payload heats
3. Update or create entities
4. Replace competition.heats list

This minimizes DB queries and relies on JPA cascading.

---

## 🧾 Frontend Data Layers

### Draft State (UX‑friendly)

```ts
startTime: Date | null
capacity: number | ''
duration: number | ''
```

### DTOs (API)

```ts
HeatDto {
  id?: number
  startTime: string
  capacity: number
  duration: number
  groups: GroupRef[]
}
```

Heats use same DTO for create and update, but most other entities have a normal dto with a required id and a create one without an id.

### Mapping

Draft → DTO mapping handles:
- Date → string
- '' → number
- trimming

---

## 🔐 Security

JWT contains:
- subject: email
- role
- id

Filter:
- loads entity based on role
- sets SecurityContext

Argument resolvers extract:
- Gym
- Series
- Climber

Controllers should NOT manually parse tokens.

---

## 📁 Backend Structure

```
com.cruxpass
 ├─ annotations        (@CurrentGym etc)
 ├─ config
 ├─ controllers
 ├─ dtos
 ├─ enums
 ├─ exceptions
 ├─ mappers
 ├─ models
 ├─ repositories
 ├─ resolvers
 ├─ security
 ├─ services
```

---

## 📁 Frontend Structure

```
src/
 ├─ components
 │   ├─ forms
 │   ├─ modals
 │   └─ ui
 ├─ constants
 ├─ context
 ├─ hooks
 ├─ models
 ├─ pages
 ├─ services
```

Uses:
- Draft state hooks
- Mapping helpers
- Context providers for Gym / Series / Climber sessions

---

## 🎯 Current Development Focus

Backend refactor in progress to support:

- Polymorphic GroupRefs stored as embeddables
- Custom competitor groups per Gym or Series
- Efficient heat syncing (create/update/delete)
- Competition create/update endpoints
- Validation of group ownership

Frontend already supports:
- Draft-based competition editor
- Custom group creation modals
- Group selection using GroupRef

Backend is being updated to match frontend contract.

## 🧭 Long‑Term Planned Features

- Stripe payments
- Judge roles
- Mobile submission PWA
- Regional and cumulative scoring
- Badge systems

Architecture is being designed to support these incrementally.

---


Maintained by: Caitlin (CruxPass)

