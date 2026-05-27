# LC-Rating Backend

Cloudflare Worker backend for lc-rating cloud sync feature.

## Features

- GitHub OAuth authentication
- Store/retrieve user progress data using Cloudflare KV
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
cd backend

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv:namespace create "LC_RATING_DATA"

# Update wrangler.toml with the KV namespace ID you got from the previous command
```

### 3. Set Secrets

```bash
# GitHub OAuth credentials
npx wrangler secret put GITHUB_CLIENT_ID
# Enter your GitHub OAuth App Client ID

npx wrangler secret put GITHUB_CLIENT_SECRET
# Enter your GitHub OAuth App Client Secret

# JWT secret (generate a random string)
npx wrangler secret put JWT_SECRET
# Enter a random secret key for JWT signing

# Allowed origins (your frontend URLs)
npx wrangler secret put ALLOWED_ORIGINS
# Enter: https://youyun8.github.io,http://localhost:3001
```

### 4. Deploy

```bash
npx wrangler deploy
```

The worker will be deployed to `https://lc-rating-backend.your-subdomain.workers.dev`

### 5. Update Frontend

Update the `API_BASE` in `apps/web/config/constants.ts` with your worker URL.

## API Endpoints

| Endpoint              | Method | Description              |
| --------------------- | ------ | ------------------------ |
| `/api/login/github`   | GET    | Redirect to GitHub OAuth |
| `/api/callback`       | GET    | OAuth callback handler   |
| `/api/uploadprogress` | POST   | Upload user progress     |
| `/api/getprogress`    | GET    | Retrieve user progress   |
| `/api/health`         | GET    | Health check             |

## Development

```bash
# Run locally
npm run dev

# The worker will be available at http://localhost:8787
```

## Data Structure

User progress is stored in KV with key format: `user:{github_id}`

```json
{
  "progress": {
    "1": "solved",
    "2": "attempted"
  },
  "progressUpdatedAt": {
    "1": 1704067200000,
    "2": 1704153600000
  },
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```
