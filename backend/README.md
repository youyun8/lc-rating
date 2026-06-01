# LC-Rating Backend

Cloudflare Worker that powers the optional cloud-sync feature of lc-rating. It
authenticates users through GitHub OAuth and stores their site data
(progress, notes, solutions, preferences) in Cloudflare KV.

This is the single source of truth for backend setup; the frontend only needs
the deployed worker URL.

## Features

- GitHub OAuth authentication.
- JWT-based session management.
- User site data stored in Cloudflare KV.
- CORS handling for multiple origins.

## Tech stack

- Runtime: Cloudflare Workers.
- Framework: [Hono](https://hono.dev/).
- Tooling: [Wrangler](https://developers.cloudflare.com/workers/wrangler/) v4.
- Language: TypeScript.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- A [GitHub OAuth App](https://github.com/settings/developers).
- Repository dependencies installed from the repo root: `pnpm install`.

All commands below run from the repo root and target the backend workspace via
`pnpm --filter lc-rating-backend`.

## 1. Create a GitHub OAuth App

1. Open GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Fill in the fields:
   - Application name: any name (for example `LC-Rating Sync`).
   - Homepage URL: `https://<your-github-username>.github.io/lc-rating`.
   - Authorization callback URL:
     `https://lc-rating-backend.<your-subdomain>.workers.dev/api/callback`.
3. Register the app, then record the Client ID and generate a Client Secret.

## 2. Create the KV namespace

1. Authenticate Wrangler with Cloudflare:

   ```bash
   pnpm --filter lc-rating-backend exec wrangler login
   ```

2. Create the namespace that stores user data:

   ```bash
   pnpm --filter lc-rating-backend setup
   ```

   The `setup` script runs `wrangler kv:namespace create LC_RATING_DATA` and
   prints the namespace ID. (Wrangler v4 also accepts the spaced form
   `wrangler kv namespace create`.)

3. Put the printed ID into `backend/wrangler.toml`:

   ```toml
   [[kv_namespaces]]
   binding = "LC_RATING_DATA"
   id = "<your-kv-namespace-id>"
   ```

## 3. Set secrets and CORS origins

Secrets are set with `wrangler secret put` (never commit them):

```bash
pnpm --filter lc-rating-backend exec wrangler secret put GITHUB_CLIENT_ID
pnpm --filter lc-rating-backend exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm --filter lc-rating-backend exec wrangler secret put JWT_SECRET
```

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` come from the OAuth App.
- `JWT_SECRET` is any random string, for example `openssl rand -base64 32`.

Allowed frontend origins are plain variables, configured in
`backend/wrangler.toml` under `[vars]`:

```toml
[vars]
ALLOWED_ORIGINS = "https://<your-github-username>.github.io,http://localhost:3001"
```

## 4. Deploy

```bash
pnpm --filter lc-rating-backend deploy
```

Wrangler prints the deployed URL, for example
`https://lc-rating-backend.<your-subdomain>.workers.dev`.

## 5. Point the frontend at the worker

The frontend resolves its backend URL in `apps/web/config/constants.ts`:

- For deployments, set `YOUR_BACKEND_URL` to the worker URL.
- For local development, set `NEXT_PUBLIC_API_BASE` instead; it takes priority
  over `YOUR_BACKEND_URL`.

The resolved value is exported as `API_BASE` and used by the sync client.

## API endpoints

| Endpoint              | Method | Description              |
| --------------------- | ------ | ------------------------ |
| `/api/login/github`   | GET    | Redirect to GitHub OAuth |
| `/api/callback`       | GET    | OAuth callback handler   |
| `/api/uploadprogress` | POST   | Upload user site data    |
| `/api/getprogress`    | GET    | Retrieve user site data  |
| `/api/health`         | GET    | Health check             |

Health check response: `{"success":true,"message":"OK"}`.

## Development and validation

```bash
# Run the worker locally at http://localhost:8787
pnpm --filter lc-rating-backend dev

# Generate types and type-check
pnpm --filter lc-rating-backend typegen
pnpm --filter lc-rating-backend check-types

# Dry-run the production build
pnpm --filter lc-rating-backend build
```

## Data structure

User site data is stored in KV under the key `user:{github_id}`:

```json
{
  "theme": "system",
  "tagLanguage": "zh",
  "linkLanguage": "zh",
  "premium": false,
  "progress": {
    "1": "solved",
    "2": "attempted"
  },
  "progressUpdatedAt": {
    "1": 1704067200000,
    "2": 1704153600000
  },
  "problemNotes": {
    "1": "Review the two-pointer invariant."
  },
  "problemNotesUpdatedAt": {
    "1": 1704067200000
  },
  "problemSolutions": {
    "1": [
      {
        "id": "sol-1",
        "title": "Hash map",
        "code": "function twoSum(nums, target) {\\n  return [];\\n}",
        "language": "javascript"
      }
    ]
  },
  "problemSolutionsUpdatedAt": {
    "1": 1704067200000
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Automated data updates and GitHub Pages

These run from the repo, independently of the worker. The workflows live in
`.github/workflows/`:

- `upstream_data_sync.yml` — syncs upstream problemset data.
- `studyplan_updater.yml` — merges upstream study-plan updates.
- `workflow.yml` — builds and deploys the site.

Both data workflows commit updates directly to the `main` branch.

To enable GitHub Pages:

1. Open the repository settings → Pages.
2. Set Source to "GitHub Actions".
3. The site deploys to `https://<your-github-username>.github.io/lc-rating`.

## Troubleshooting

- OAuth callback fails: confirm the OAuth App callback URL matches the worker
  URL, and that `ALLOWED_ORIGINS` includes the frontend domain.
- Cannot deploy: confirm `wrangler login` succeeded and the KV namespace ID in
  `wrangler.toml` is correct.
- Data not syncing: check the browser console for CORS errors, confirm the
  backend URL in `constants.ts`, and test `/api/health`.
