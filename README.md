# Guidia

### Learn. Practice. Stay Safe.

Guidia is an AI-powered digital inclusion and safety platform designed to help senior citizens learn, practice, and confidently use essential digital services. It addresses a common problem of digital adoption: knowing that technology is useful does not necessarily mean feeling comfortable or safe while using it.

Instead of functioning as a conventional learning management system or a generic AI chatbot, Guidia creates a supportive digital learning environment where users can learn at their own pace, practice unfamiliar tasks without real-world consequences, receive AI-guided assistance, detect potential scams, involve a trusted guardian when necessary, and retain what they have learned through personalized memory and recall.

The platform is built around the principle that technology should feel simple, understandable, and safe.

---

## Overview

Many senior citizens encounter difficulties when interacting with modern digital services such as mobile banking, digital payments, email, messaging, social media, telemedicine platforms, and online services. The difficulty is not always caused by a lack of intelligence or willingness to learn. Complex interfaces, unfamiliar terminology, fear of making irreversible mistakes, scams, and lack of immediate assistance can create hesitation and loss of confidence.

Guidia approaches digital literacy as both a **learning problem and a confidence and safety problem**.

The platform continuously considers the user's current level of comfort and adapts the learning experience accordingly.

The central Guidia experience can be represented as:

**Emotional State → Adaptive Interface → AI Guidance → Safe Practice → Safety Interception → Memory → Confidence & Competence → Personalized Adaptation**

This creates a continuous learning loop rather than a collection of independent features.

---

# Vision

Guidia aims to make digital technology more approachable for people who may feel excluded, uncertain, or vulnerable while using modern digital services.

The platform focuses on three principles:

### Simplicity

Digital tasks should be explained in language and steps that users can understand without requiring technical knowledge.

### Safety

Users should have opportunities to practice unfamiliar actions without risking real money, messages, accounts, or personal information.

### Confidence

Learning should not end when a tutorial is completed. Guidia should help users remember what they learned and gradually become more independent.

---

# Core Product Architecture

Guidia is organized around seven interconnected layers.

## 1. User Entry

The user enters Guidia through a simple, trustworthy and accessible experience rather than being immediately presented with a complex dashboard.

The entry experience introduces the purpose of Guidia and provides clear paths to:

* Get Started
* Log In
* Learn More
* Understand Safety
* Access Help

---

## 2. Onboarding & Emotional Calibration

Guidia identifies how comfortable the user currently feels with technology and adapts the experience accordingly.

The platform uses three primary cognitive-load states:

* **CALM**
* **UNSURE**
* **SCARED**

These states influence the presentation of information rather than functioning as clinical psychological diagnoses.

The Cognitive Load Governor can adjust:

* explanation verbosity
* information density
* animation speed
* voice speed
* confirmation frequency
* vocabulary complexity
* button sizing
* tutorial detail
* number of simultaneous decisions

When the user appears to be struggling, the platform can simplify the experience and provide additional reassurance.

---

## 3. AI Core Engine

The AI Core provides the intelligence behind Guidia's learning and assistance features.

It includes:

* AI Screenshot Understanding
* Visual Explanation
* Voice Explanation
* AI Learning Assistant
* Knowledge Retrieval
* Context-aware response generation
* Safety-aware response validation

The AI should understand the user's current task and cognitive-load state rather than behaving like a generic conversational assistant.

---

## 4. Learning

Guidia provides progressive digital literacy learning through structured tutorials and safe practice environments.

Learning domains can include:

* Messaging
* Email
* Video Calling
* Social Media
* Mobile Banking
* Digital Payments
* Privacy Settings
* Cybersecurity
* General App Navigation

Tutorials can progress through:

**Beginner → Intermediate → Advanced**

The level of assistance decreases as the user's competence increases.

---

## 5. Safety

Safety is integrated directly into the learning experience.

Guidia provides:

* Scam & Risk Detection
* Psychological Safety Interception
* Guardian Assistance
* Risk explanations
* Confirmation mechanisms
* Safe Practice environments

The objective is not simply to warn users after something goes wrong, but to intervene before potentially harmful actions occur.

---

## 6. Memory & Progress

Guidia records meaningful learning activity so users can return to previously learned concepts without repeating an entire course.

The Memory Book can contain:

* completed lessons
* saved visual explanations
* tutorial steps
* practice history
* voice recall guides
* saved learning moments

Users can revisit material through:

* Read it to me
* Show visual guide
* Show steps
* Practice again

---

## 7. Outcome

The final objective is not merely course completion.

Guidia evaluates progress through both:

**Confidence**

and

**Competence**

These are treated as different dimensions.

A user may feel confident without being fully competent, or may have the ability to complete a task while still feeling uncertain.

This distinction allows Guidia to personalize future learning and safety interventions.

---

# Core Guidia Modules

## AI Screenshot Understanding

Users can provide a screenshot of a digital interface and ask Guidia what they are seeing or what they should do.

The intended architecture accepts:

* Screenshot
* Optional user question
* Current task
* Cognitive-load state

The multimodal AI system analyzes the interface and identifies relevant elements.

The result can be converted into a structured visual explanation.

---

## Visual Explanation

Guidia can explain an interface visually using:

* numbered markers
* arrows
* highlights
* labels
* focused areas
* step-by-step overlays

The objective is to explain one meaningful action at a time rather than overwhelming the user with annotations.

Visual explanations can also be stored for later use through the Memory Book.

---

## Voice Explanation

Voice guidance is designed for users who may find written instructions difficult to follow.

The system is intended to support:

* Play
* Pause
* Resume
* Stop
* Replay
* Speed adjustment

Voice speed and explanation complexity can respond to the user's cognitive-load state.

English and Bengali support can be incorporated into the voice experience.

Where a dedicated TTS service is unavailable, browser-based speech synthesis can provide an initial implementation.

---

## AI Assistant

The Guidia AI Assistant acts as a digital learning tutor.

It should:

* explain unfamiliar concepts
* guide users through tasks
* answer digital literacy questions
* provide numbered steps
* use beginner-friendly vocabulary
* understand the current learning context
* adapt explanations according to the user's cognitive-load state
* provide safety-aware guidance

The assistant is not intended to be a general-purpose ChatGPT replacement.

Its knowledge should be grounded in approved Guidia content such as:

* lessons
* tutorials
* FAQs
* safety guidelines
* digital literacy material
* approved explanations

A Retrieval-Augmented Generation architecture can be used to support this grounding.

---

# Safe Practice Mode

Safe Practice allows users to learn unfamiliar digital tasks without exposing themselves to real-world consequences.

Potential simulated environments include:

* Messaging
* Email
* Social Media
* Mobile Banking
* Digital Payments
* Phone and Video Calling

For example, a user can practice sending a simulated payment without transferring real money.

A practice environment must never:

* send a real message
* transfer real money
* modify a real bank account
* call a real person
* change an external account
* expose real credentials

These environments should be clearly identified as **Safe Practice** or **Simulation**.

The purpose is to allow users to make mistakes safely.

---

# Progressive Tutorial System

Guidia supports progressive learning.

### Beginner

Users receive:

* detailed instructions
* visual guidance
* larger controls
* slower narration
* frequent confirmation
* additional explanations

### Intermediate

The system reduces assistance and allows users to perform more steps independently.

### Advanced

The system provides minimal guidance and focuses on independent task completion and confidence building.

This creates a gradual transition from:

**Guided → Supported → Independent**

---

# Scam & Risk Detection

Guidia provides a dedicated safety layer for potentially suspicious digital content.

Users can submit:

* URLs
* SMS messages
* chat messages
* screenshots

The system can classify potential risk as:

* **WARNING**
* **HIGH RISK**
* **CRITICAL**

The explanation should clearly communicate:

1. What appears suspicious
2. Why it may be dangerous
3. What the user should do
4. What the user should avoid doing

---

## Hybrid Safety Architecture

Risk detection should not rely exclusively on an LLM.

Deterministic signals can identify:

* suspicious URLs
* shortened URLs
* urgent requests
* OTP requests
* password requests
* payment requests
* impersonation
* suspicious domains

AI-based contextual analysis can then help interpret the broader context.

This hybrid approach provides greater predictability for safety-sensitive functionality.

---

# Psychological Safety Net

Certain actions should trigger an additional confirmation layer.

Examples include:

* financial transfers
* sensitive information submission
* account deletion
* permission grants
* potentially irreversible actions

Before proceeding, Guidia can break the action into:

### What are you doing?

### Who is involved?

### What information or amount is being shared?

### What happens next?

The user can then choose:

* Proceed
* Edit
* Request Help

The purpose is not to block users unnecessarily.

It is to create a moment of reflection before potentially harmful or irreversible actions.

---

# Proxy Guardian

Guidia can connect a senior user with a trusted guardian.

The relationship follows:

**Senior User ↔ Guardian Relationship ↔ Guardian**

The guardian system can support:

* invitations
* acceptance
* consent
* revocation
* approval requests
* notifications
* configurable thresholds
* approval
* rejection
* flagging

Guardian access must always require explicit user consent.

The initial implementation may use simulated financial actions for demonstration purposes.

Guidia should not claim to be connected to real banking infrastructure unless an actual integration exists.

---

# Memory Book

The Memory Book is designed to help users remember what they have learned.

Instead of forcing users to repeat complete tutorials, Guidia stores meaningful learning experiences.

A Memory Book entry may contain:

* lesson information
* saved screenshots
* visual explanations
* step sequences
* voice guidance
* practice history

Users can return to an entry and choose:

**Read it to me**

**Show visual guide**

**Show steps**

**Practice again**

The Memory Book should feel personal and useful rather than functioning like a conventional database history page.

---

# Confidence & Competence

Guidia distinguishes between confidence and competence.

### Confidence

How comfortable the user feels performing a digital task.

### Competence

How successfully and independently the user can perform that task.

Progress can consider:

* lesson completion
* practice success
* mistakes
* repeated attempts
* independent completion
* recall activity
* assistance required

This information can influence:

* tutorial difficulty
* future recommendations
* AI explanation detail
* safety confirmation frequency
* practice scenarios

---

# Authentication & User Management

Guidia should support secure user accounts.

Registration can include:

* Full name
* Email
* Password
* Password confirmation
* Preferred language

Login should support:

* Email
* Password
* Remember me
* Forgot password
* Logout
* Session management

The application should handle:

* duplicate accounts
* invalid email addresses
* weak passwords
* incorrect credentials
* expired sessions
* unauthorized access
* protected routes

Passwords must never be stored as plaintext.

API credentials and secrets must never be exposed in frontend source code.

---

# Accessibility

Accessibility is a core part of Guidia rather than an optional enhancement.

The platform should support:

* adjustable text size
* high contrast
* dark mode
* reduced motion
* voice playback
* subtitles/transcripts
* English/Bengali language support
* large touch targets
* keyboard navigation
* visible focus states
* accessible form controls
* appropriate ARIA labels

Guidia should be usable across:

* smartphones
* tablets
* desktop browsers

The interface should never rely solely on color to communicate meaning.

---

# Responsive Design

Guidia should provide intentional experiences for different screen sizes.

## Mobile

Prioritize:

* thumb-friendly controls
* simple navigation
* single-column layouts
* large buttons
* sticky primary actions
* bottom navigation where appropriate

## Tablet

Provide a balanced layout between mobile simplicity and desktop information density.

## Desktop

Support:

* persistent navigation
* expanded learning areas
* larger content regions
* multi-panel workflows where useful

Responsive behavior should be designed rather than simply shrinking the desktop interface.

---

# Navigation

The senior user experience should remain intentionally simple.

### Senior

* Home
* Learn
* Practice
* Ask Guidia
* Safety
* Memory Book
* Progress
* Help
* Settings

### Guardian

* Overview
* Approval Requests
* Activity
* Settings

### Administrator

* Overview
* Users
* Learning Content
* Practice Applications
* Safety
* Analytics
* Audit Logs
* Settings

Users should only see functionality they are authorized to access.

---

# Notifications

Guidia can provide notifications for:

* learning reminders
* safety alerts
* guardian approval requests
* Memory Book reminders
* important system messages

Notification counts and content should come from application data rather than being hardcoded directly into UI components.

The interface should support:

* unread state
* read state
* empty state
* notification history

---

# Administration & Analytics

The administrative experience should be separate from the senior-user experience.

Potential analytics include:

### Learning

* lesson completion
* practice success
* task completion
* errors per session

### Safety

* risk assessments
* severity distribution
* safety interventions
* guardian approvals

### Adaptation

* emotional-state distribution
* state transitions
* repeated-error triggers

### Memory

* Memory Book usage
* replay activity
* return visits

Evaluation datasets must remain separate from real production analytics.

Research results and demonstration metrics must never be presented as live user statistics.

---

# Technology Architecture

The exact technologies should follow the existing repository where practical, but the application should evolve toward a clean full-stack architecture.

The current repository is based on a React and Vite frontend.

The project currently includes technologies such as:

* React
* Vite
* React Router
* Bootstrap-compatible responsive design
* Lucide React
* Google GenAI integration

The final backend and database technologies should be determined after auditing the existing `backend` directory and its implementation.

The architecture should separate:

### Presentation Layer

React components and pages.

### State Layer

User state, cognitive state, progress, notifications and application state.

### Service Layer

Authentication, AI, safety, learning, guardian and notification services.

### API Layer

Secure backend endpoints.

### Data Layer

Persistent database models and repositories.

### AI Gateway

A provider-independent interface for:

* LLM
* VLM
* TTS
* embeddings
* safety analysis

AI model names should be configurable through environment variables.

---

# Suggested Data Entities

The following entities represent the conceptual data model and should be reconciled with the existing backend before implementation:

* User
* Role
* UserRole
* UserPreference
* EmotionalState
* ConfidenceProfile
* Category
* Course
* Lesson
* LessonStep
* Quiz
* QuizQuestion
* QuizOption
* QuizAttempt
* PracticeApplication
* PracticeScenario
* PracticeStep
* PracticeAttempt
* ScreenshotAnalysis
* VisualExplanation
* AIConversation
* AIMessage
* RiskAssessment
* SafetyEvent
* SafetyInterception
* Guardian
* GuardianRelationship
* GuardianApproval
* MemoryBookEntry
* VoiceRecall
* Notification
* LearningProgress
* SkillProgress
* AuditLog

These are conceptual entities rather than a requirement to create every table exactly as listed.

---

# AI Architecture

Guidia should use an AI Gateway rather than embedding model calls throughout React components.

A conceptual pipeline is:

```text
User Input
    ↓
Context Collection
    ↓
Guidia Knowledge Retrieval
    ↓
AI / VLM Processing
    ↓
Response Validation
    ↓
Safety Filtering
    ↓
Cognitive Load Adaptation
    ↓
Final Response
```

The architecture should allow AI providers and models to be changed without rewriting the application.

Environment configuration should follow a pattern similar to:

```env
AI_PROVIDER=gemini
GEMINI_MODEL=<configured-model>
GEMINI_API_KEY=<your-key>
```

Actual model names should be documented according to the provider configuration used by the deployment.

Never commit API keys to Git.

---

# Screenshot Analysis Architecture

A secure screenshot workflow should follow:

```text
Upload
  ↓
File Validation
  ↓
Compression / Normalization
  ↓
Temporary Storage
  ↓
Vision Model
  ↓
Structured Analysis
  ↓
Visual Annotation
  ↓
User Explanation
  ↓
Temporary Data Cleanup
```

Uploaded files should be validated for:

* MIME type
* file size
* filename safety
* supported format

Screenshots should not be retained unnecessarily.

---

# Security & Privacy

Guidia deals with potentially sensitive user interactions and therefore must prioritize security and privacy.

Security considerations include:

* secure authentication
* password hashing
* authorization
* protected routes
* input validation
* API security
* rate limiting
* secure file uploads
* secret management
* session management
* XSS protection
* privacy-aware logging
* audit trails

Guidia should collect only the information necessary for the functionality being provided.

Device adaptation should not require unnecessary device information.

Guardian relationships must always be based on explicit consent.

---

# Safe Simulation Boundary

Some Guidia features are intentionally simulated.

Examples include:

* banking applications
* digital payments
* messaging
* social media
* external service interactions

This is intentional because Guidia's purpose is to allow users to practice without creating real-world consequences.

Simulated functionality must always be distinguishable from real-world integrations.

The application must never imply that a simulated payment is a real financial transaction.

---

# Demonstration Mode

Guidia can provide a controlled demonstration journey that showcases the complete product concept.

A representative demonstration can show:

```text
User enters in SCARED state
        ↓
Interface simplifies
        ↓
User struggles
        ↓
Cognitive Load Governor adapts
        ↓
AI provides simpler instructions
        ↓
User enters Safe Practice
        ↓
User successfully completes a task
        ↓
Suspicious message appears
        ↓
Scam Detection identifies the risk
        ↓
Psychological Safety Net intervenes
        ↓
Guardian assistance is requested
        ↓
Guardian approves simulated action
        ↓
Experience is stored in Memory Book
        ↓
Confidence / Competence profile updates
        ↓
Next learning recommendation adapts
```

This demonstrates the complete Guidia concept rather than presenting isolated features.

---

# Data Integrity

Guidia must never fabricate production analytics.

If research or demonstration values are used, they must be clearly labeled as:

* Evaluation Dataset
* Research Results
* Demonstration Metrics

They must not be presented as actual live platform statistics.

Demo data should be separated from production data.

---

# Design Philosophy

Guidia should feel:

* professional
* trustworthy
* calm
* modern
* accessible
* intelligent
* human
* reassuring

It should NOT feel:

* childish
* overly colorful
* emoji-driven
* like a generic Bootstrap dashboard
* like a university CRUD project
* like a generic chatbot
* like a collection of disconnected cards
* like a fake banking application

Senior-friendly design does not mean childish design.

Accessible design does not mean boring design.

Simple design does not mean empty design.

Professional design does not mean complicated design.

---

# Development Principles

Guidia should follow these principles throughout development:

1. Inspect existing code before rewriting it.
2. Preserve useful functionality.
3. Replace poor UI decisions rather than decorating them.
4. Separate data from presentation.
5. Avoid hardcoded production data.
6. Keep demo data explicitly separated.
7. Never fake functionality that does not exist.
8. Clearly label simulations.
9. Never expose API secrets.
10. Use reusable components.
11. Keep business logic outside UI components where practical.
12. Validate user input.
13. Design for accessibility from the beginning.
14. Test responsive layouts.
15. Test error states.
16. Test unauthorized access.
17. Test loading and empty states.
18. Run lint and build after major changes.
19. Document architectural decisions.
20. Keep the product experience coherent.

---

# Recommended Project Structure

The final structure may evolve according to the existing repository, but a clean architecture can follow a pattern similar to:

```text
Guidia/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── ai/
│   │   ├── safety/
│   │   └── utils/
│   └── ...
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── navigation/
│   │   ├── learning/
│   │   ├── practice/
│   │   ├── safety/
│   │   ├── guardian/
│   │   ├── memory/
│   │   └── accessibility/
│   │
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── constants/
│   └── styles/
│
├── docs/
│   ├── GUIDIA_CURRENT_ARCHITECTURE.md
│   ├── GUIDIA_IMPLEMENTATION_PLAN.md
│   ├── AI_ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── SECURITY.md
│   └── ACCESSIBILITY.md
│
├── .env.example
├── README.md
├── package.json
└── vite.config.js
```

The actual project structure should be adapted to the existing codebase rather than forcing an unnecessary rewrite.

---

# Installation

Clone the repository:

```bash
git clone git@github.com:AsmitaEsha/Guidia.git
cd Guidia
```

Install frontend dependencies:

```bash
npm install
```

If the backend has a separate dependency configuration, install its dependencies according to the backend documentation.

---

# Environment Variables

Create an environment file based on the project's `.env.example`.

AI credentials and other secrets must be stored in environment variables.

For example:

```env
AI_PROVIDER=gemini
GEMINI_MODEL=<configured-model>
GEMINI_API_KEY=<your-api-key>
```

Do not commit `.env` files containing real credentials.

---

# Development

Start the frontend development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Backend development commands should be documented separately once the backend architecture has been finalized.

---

# Testing

Guidia should be tested across:

### Functional

* registration
* login
* logout
* protected routes
* lessons
* practice scenarios
* AI assistant
* screenshot analysis
* safety analysis
* guardian requests
* Memory Book
* notifications

### Accessibility

* keyboard navigation
* text scaling
* contrast
* screen reader labels
* reduced motion
* focus visibility

### Responsive

* mobile
* tablet
* desktop

### Security

* unauthorized access
* invalid input
* authentication failures
* file upload validation
* secret exposure
* session handling

### Performance

* initial load
* route transitions
* screenshot processing
* AI response handling
* mobile performance

---

# Deployment

The final deployment architecture should separate:

* frontend
* backend/API
* database
* AI services
* file storage where required

Production configuration should use environment variables and secure secret management.

Before deployment, verify:

* production build succeeds
* environment variables are configured
* authentication works
* protected routes work
* database migrations are applied
* API endpoints are secured
* AI keys are not exposed
* uploads are validated
* error handling is production-safe
* accessibility checks pass
* responsive layouts work

---

# Current Status

Guidia is being developed from an existing high-fidelity prototype toward a more complete and production-oriented full-stack platform.

The repository currently contains the initial application structure and feature concepts, including interfaces for:

* onboarding
* home
* learning
* safe practice
* AI assistance
* safety
* screenshot analysis
* visual explanation
* Memory Book
* guardian support
* progress
* notifications
* settings
* emergency help

Some advanced capabilities may initially operate as controlled simulations while their full production architecture is developed.

The project should clearly distinguish between:

**Implemented**

**In Development**

**Simulated**

**Planned**

rather than presenting unfinished functionality as production-ready.

---

# Roadmap

## Phase 1 — Foundation

* repository audit
* architecture documentation
* design system
* routing
* responsive foundation
* reusable components

## Phase 2 — Authentication

* registration
* login
* logout
* protected routes
* user roles
* session management

## Phase 3 — Adaptive Experience

* onboarding
* emotional calibration
* Cognitive Load Governor
* accessibility preferences

## Phase 4 — AI Core

* AI Gateway
* AI Assistant
* knowledge retrieval
* multimodal screenshot analysis
* response validation

## Phase 5 — Learning & Practice

* structured lessons
* progressive tutorials
* Safe Practice
* practice analytics

## Phase 6 — Safety

* scam detection
* risk classification
* Psychological Safety Net
* safety history

## Phase 7 — Guardian

* invitation
* consent
* approval workflow
* notifications

## Phase 8 — Memory

* Memory Book
* voice recall
* visual recall
* practice replay

## Phase 9 — Personalization

* confidence profile
* competence profile
* adaptive recommendations

## Phase 10 — Production Readiness

* security review
* accessibility review
* performance optimization
* automated testing
* deployment
* documentation

---

# Guidia's Core Promise

Guidia is built around a simple idea:

**Technology should not become inaccessible simply because it becomes complicated.**

A user should be able to learn a new digital task without fear of making an irreversible mistake.

They should be able to practice safely.

They should be able to ask for help without feeling embarrassed.

They should be warned when something looks suspicious.

They should be able to involve someone they trust when necessary.

And when they return later, Guidia should remember what they learned and help them continue from there.

**Guidia exists to make digital technology easier to understand, safer to practice, and easier to remember.**




# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
