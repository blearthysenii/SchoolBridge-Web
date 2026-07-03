# SchoolBridge Frontend

SchoolBridge Frontend is the React application for teachers and students. Teachers manage classrooms, students, subjects, topics, tests, online sessions, results, and analytics. Students can join online tests without creating accounts.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- Google OAuth

## Features

- Login, register, forgot password, reset password, and Google login
- "Më mbaj të kyçur" session persistence
- Protected routes that restore valid tokens automatically
- Dashboard with class, student, test, result, and insight summaries
- Classroom management
- Student create/edit/details/result flows
- Subject and topic management
- Test builder and PDF test download
- Online test session control for teachers
- Public online test page for students
- Autosaved student answers during online tests
- AI grading review with teacher overrides
- AI session analytics and PDF export
- Student, test, classroom, and topic analytics
- Responsive UI for desktop, tablet, and mobile

## Routes

Public routes:

```text
/
/login
/register
/forgot-password
/reset-password
/complete-google-register
/online-test
/online-test/:sessionCode
```

Protected teacher routes:

```text
/dashboard
/classrooms/:id
/tests/:id
/tests/:id/analytics
/students/:id/results
/submit-results
/test-sessions/:code
/inactive-classrooms
/inactive-students
/inactive-subjects
/inactive-concepts
/archived-tests
```

## Environment Variables

Create `.env` in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Default local URL:

```text
http://localhost:5173
```

## Build

```bash
npm run lint
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Tests

This frontend currently does not include a unit test runner such as Vitest, Jest, or React Testing Library. The safe automated checks available today are:

```bash
npm run lint
npm run build
```

Recommended next step: add Vitest with React Testing Library for route guards, auth token persistence, and the online test autosave flow.

## Authentication Notes

The app stores normal sessions in `sessionStorage` and remembered sessions in `localStorage`. All API calls use the shared auth helper and Axios interceptor, so protected routes and services read tokens consistently.

Logout clears both `localStorage` and `sessionStorage`.

## Deployment Notes

- Set `VITE_API_URL` to the deployed backend API URL.
- Set `VITE_GOOGLE_CLIENT_ID` to the Google OAuth client configured for the deployed domain.
- Configure the backend `CORS_ORIGINS` to include the deployed frontend URL.
- Run `npm run build` and deploy the `dist` folder to the frontend host.
- Configure SPA fallback so unknown routes serve `index.html`.
