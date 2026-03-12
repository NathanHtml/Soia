# SOIA Chat UI - Setup

Minimal chat console.

## Configure (local only)
1. Copy `config.example.js` to `config.local.js`.
2. Set `API_BASE`, `PATH` (e.g., `/chat`), and headers if needed.
3. Keep `config.local.js` out of commits.

## Run locally
```
npx serve .
# or
python -m http.server 8000
```
Open `http://localhost:3000` (serve) or `http://localhost:8000` (python).

## Payload shape
```json
{ "message": "<user text>", "history": [ { "role": "...", "content": "..." } ] }
```
Replies are read from `reply`, `response`, `message`, `choices[0].message.content`, or the raw payload stringified.

## Files to adjust
- UI: `index.html`, `assets/css/style.css`
- Logic: `assets/js/app.js`
- Config template: `config.example.js` (copy to `config.local.js`)
