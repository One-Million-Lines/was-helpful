# Contributing

Thanks for your interest in contributing.

## Local setup

```bash
npm install
python -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Run the backend with `cd backend && python main.py` and the frontend with `npm run dev`.

## Making changes

- Keep public API changes documented in the README
- Test widget configuration changes through the preview and embed flows
- Run `npm run build` and `npm run lint` before opening a pull request

## Pull requests

1. Fork the repository
2. Create a branch for your work
3. Make and document your changes
4. Open a pull request with context and screenshots where useful

## Reporting issues

Open a GitHub issue with reproduction steps, expected behavior, and environment details.
