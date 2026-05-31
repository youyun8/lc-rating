# LC-Rating Backend

Cloudflare Worker backend for lc-rating cloud sync feature.

## Features

- GitHub OAuth authentication
- Store/retrieve user site data using Cloudflare KV
- JWT-based session management
- CORS support for multiple origins

## Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [GitHub OAuth App](https://github.com/settings/developers)
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Setup

### 1. Create GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in:
   - **Application name**: LC-Rating Sync (or any name)
   - **Homepage URL**: `https://youyun8.github.io/lc-rating`
   - **Authorization callback URL**: `https://lc-rating-backend.your-subdomain.workers.dev/api/callback`
3. Save the **Client ID** and generate a **Client Secret**

### 2. Deploy the Worker

```bash
# Install dependencies
pnpm install

# Login to Cloudflare
pnpm --filter lc-rating-backend exec wrangler login

# Create KV namespace
pnpm --filter lc-rating-backend setup

# Update wrangler.toml with the KV namespace ID you got from the previous command
```

### 3. Set Secrets

```bash
# GitHub OAuth credentials
pnpm --filter lc-rating-backend exec wrangler secret put GITHUB_CLIENT_ID
# Enter your GitHub OAuth App Client ID

pnpm --filter lc-rating-backend exec wrangler secret put GITHUB_CLIENT_SECRET
# Enter your GitHub OAuth App Client Secret

# JWT secret (generate a random string)
pnpm --filter lc-rating-backend exec wrangler secret put JWT_SECRET
# Enter a random secret key for JWT signing
```

Allowed frontend origins are configured in `wrangler.toml` as
`ALLOWED_ORIGINS`.

### 4. Deploy

```bash
pnpm --filter lc-rating-backend deploy
```

The worker will be deployed to `https://lc-rating-backend.your-subdomain.workers.dev`

### 5. Update Frontend

Update the `API_BASE` in `apps/web/config/constants.ts` with your worker URL.

## API Endpoints

| Endpoint              | Method | Description              |
| --------------------- | ------ | ------------------------ |
| `/api/login/github`   | GET    | Redirect to GitHub OAuth |
| `/api/callback`       | GET    | OAuth callback handler   |
| `/api/uploadprogress` | POST   | Upload user site data    |
| `/api/getprogress`    | GET    | Retrieve user site data  |
| `/api/health`         | GET    | Health check             |

## Development

```bash
# Run locally
pnpm --filter lc-rating-backend dev

# The worker will be available at http://localhost:8787
```

## Validation

```bash
pnpm --filter lc-rating-backend typegen
pnpm --filter lc-rating-backend check-types
pnpm --filter lc-rating-backend build
```

## Data Structure

User site data is stored in KV with key format: `user:{github_id}`

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
