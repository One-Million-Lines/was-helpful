# WasHelpful

WasHelpful is a feedback collection platform for embedding a simple “Was this helpful?” widget into product docs, help centers, or support surfaces. It includes a React admin dashboard for managing projects and widget settings plus a FastAPI backend for public vote and feedback collection.

## What it does

It lets you configure a helpfulness widget per project, embed it into external pages, and review votes, follow-up responses, and analytics from an admin dashboard.

## Why it exists

Teams often know that content is underperforming, but they do not get structured feedback at the point where users are reading it. WasHelpful turns that gap into a lightweight collection flow with per-project configuration and reporting.

## Features

- Project-based widget management
- Configurable question text, labels, follow-up prompts, poll options, display modes, and theme values
- Live widget preview in the admin UI
- Embed instructions for script, inline mount, and React usage
- Public vote and feedback endpoints with basic rate limiting and input sanitization
- Dashboard cards and analytics for up-votes, down-votes, and follow-up responses
- Authenticated admin routes for project management and reporting

## How it works

1. The admin frontend uses `VITE_API_BASE` to talk to the FastAPI backend.
2. Each project stores widget configuration in MongoDB-backed storage.
3. Public clients fetch widget config from `/public/config`, then submit votes and follow-up feedback through public endpoints.
4. The admin dashboard reads aggregated vote and feedback data from authenticated `/projects` and `/feedback` routes.
5. Embed instructions are generated per project so the same backend can serve multiple widget configurations.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- FastAPI
- PyMongo
- python-jose
- bcrypt
- slowapi

## Project structure

```text
src/
  components/        dashboard UI and widget preview
  contexts/          auth state
  pages/             dashboard, project detail, project config, embed instructions
  services/          frontend API client
backend/
  api_auth.py        admin authentication
  api_projects.py    project CRUD
  api_public.py      public widget config and feedback endpoints
  api_feedback.py    admin analytics and response views
  data_models.py     widget and feedback schemas
  main.py            API entry point
  requirements.txt   backend dependency list
  vtconf.d/          backend config definitions
```

## Getting started

```bash
git clone <repo-url>
cd was-helpful
npm install
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Start the backend:

```bash
cd backend
python main.py
```

In a second terminal, start the frontend:

```bash
cd was-helpful
npm run dev
```

Open:

- Frontend: `http://localhost:5332`
- API: `http://localhost:5232`
- API docs: `http://localhost:5232/docs`

## Configuration

The frontend reads:

```env
VITE_API_BASE=http://localhost:5232
```

The backend loads `backend/.env` and expects:

```env
APP_HOST=0.0.0.0
APP_PORT=5232
JWT_SECRET=change-me
PERMANENT_STORAGE=mongodb
PERMANENT_DB=washelpful
json_MONGO_CONN1={"string":"mongodb://localhost:27017","user":"","password":""}
OPENAI_APIKEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
```

## Usage

1. Create a project in the dashboard.
2. Adjust widget copy, follow-up behavior, display mode, and theme settings.
3. Copy the generated embed snippet for the project.
4. Publish the snippet on the target page or product surface.
5. Review votes, feedback responses, and analytics in the admin UI.

## Development

```bash
npm run dev
npm run build
npm run lint
npm run preview
cd backend && python main.py
```

There are currently no automated tests in the repository.

## Roadmap

- Add automated tests for public feedback and admin flows
- Document the widget runtime and hosting expectations in more detail
- Add a deployment recipe for frontend and API hosting
- Expand analytics beyond vote totals and poll distribution

## Contributing

This project is public and open for collaboration. If you’re interested in contributing, improving the project, or discussing ideas, feel free to reach out.

LinkedIn: https://linkedin.com/in/alexrada

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a pull request

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
