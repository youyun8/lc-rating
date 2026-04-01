# Backend Setup Guide for lc-rating

This guide explains how to set up your own backend infrastructure for the lc-rating project.

## Overview

Two features can be customized for your deployment:

1. **Cloud Sync Backend** - Cloudflare Worker for syncing user progress data
2. **Automated Problem Updates** - GitHub Actions workflows (already configured)

---

## 1. Cloud Sync Backend Setup

### Step 1: Create a GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `LC-Rating Sync`
   - **Homepage URL**: `https://<your-github-username>.github.io/lc-rating`
   - **Authorization callback URL**: `https://lc-rating-backend.your-account.workers.dev/api/callback`
     - Replace `your-account` with your Cloudflare account subdomain
4. Click **"Register application"**
5. Save the **Client ID** (shown on the next page)
6. Click **"Generate a new client secret"** and save it

### Step 2: Deploy the Cloudflare Worker

1. **Install Wrangler CLI** (if not already installed):

   ```bash
   npm install -g wrangler
   ```

2. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Login to Cloudflare**:

   ```bash
   npx wrangler login
   ```

5. **Create a KV namespace** for storing user data:

   ```bash
   npx wrangler kv:namespace create "LC_RATING_DATA"
   ```

   This will output something like:

   ```
   ✨ Success!
   Add the following to your configuration file:
   [[kv_namespaces]]
   binding = "LC_RATING_DATA"
   id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

6. **Update `wrangler.toml`** with the KV namespace ID from the previous step:

   ```toml
   [[kv_namespaces]]
   binding = "LC_RATING_DATA"
   id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # <-- Replace this
   ```

7. **Set the required secrets**:

   ```bash
   # GitHub OAuth Client ID
   npx wrangler secret put GITHUB_CLIENT_ID
   # Enter: your_github_oauth_client_id

   # GitHub OAuth Client Secret
   npx wrangler secret put GITHUB_CLIENT_SECRET
   # Enter: your_github_oauth_client_secret

   # JWT Secret (generate a random string, e.g., using: openssl rand -base64 32)
   npx wrangler secret put JWT_SECRET
   # Enter: your_random_jwt_secret

   # Allowed Origins (your frontend URLs)
   npx wrangler secret put ALLOWED_ORIGINS
   # Enter: https://<your-github-username>.github.io,http://localhost:3001

   ```

8. **Deploy the worker**:

   ```bash
   npx wrangler deploy
   ```

   After deployment, you'll get a URL like:

   ```
   https://lc-rating-backend.your-account.workers.dev
   ```

### Step 3: Update Frontend Configuration

1. Open `apps/web/config/constants.ts`

2. Find this line and update it with your worker URL:

   ```typescript
   const YOUR_BACKEND_URL =
     "https://lc-rating-backend.your-account.workers.dev";
   ```

3. Save the file and commit:
   ```bash
   git add apps/web/config/constants.ts
   git commit -m "config: update backend URL for cloud sync"
   git push
   ```

### Step 4: Test the Setup

1. **Test the backend health**:

   ```bash
   curl https://lc-rating-backend.your-account.workers.dev/api/health
   ```

   Should return: `{"success":true,"message":"OK"}`

2. **Test GitHub OAuth**:
   - Visit your site: `https://<your-github-username>.github.io/lc-rating`
   - Click the cloud sync button
   - Try to log in with GitHub
   - Your progress should sync successfully

---

## 2. Automated Problem Updates (Already Configured)

The GitHub Actions workflows have been updated for your account. They will:

- **Problemset Updater**: Run every Monday at 12:10 Beijing time
- **Rating Solution Updater**: Run every Monday at 13:00 Beijing time
- Both will commit updates directly to your `main` branch

### Workflows Location:

- `.github/workflows/problemset_updater.yml`
- `.github/workflows/rating_solution_updater.yml`
- `.github/workflows/workflow.yml` (build & deploy)

### To Enable GitHub Pages Deployment:

1. Go to your repo settings: `https://github.com/<your-github-username>/lc-rating/settings`
2. Navigate to **Pages** in the sidebar
3. Set **Source** to "GitHub Actions"
4. The site will be deployed to: `https://<your-github-username>.github.io/lc-rating`

---

## Files Created/Modified

### New Files:

- `backend/package.json` - Backend dependencies
- `backend/wrangler.toml` - Cloudflare configuration
- `backend/src/index.ts` - Main worker code
- `backend/tsconfig.json` - TypeScript configuration
- `backend/README.md` - Backend documentation
- `BACKEND_SETUP.md` - This guide

### Modified Files:

- `apps/web/config/constants.ts` - Added YOUR_BACKEND_URL configuration
- `.github/workflows/problemset_updater.yml` - Added comments
- `.github/workflows/rating_solution_updater.yml` - Added comments

---

## Troubleshooting

### Issue: OAuth callback fails

- Check that the callback URL in GitHub OAuth App matches your worker URL
- Verify `ALLOWED_ORIGINS` secret includes your frontend domain

### Issue: Can't deploy worker

- Make sure you're logged in: `npx wrangler login`
- Check that KV namespace is created and ID is correct in wrangler.toml

### Issue: Data not syncing

- Check browser console for CORS errors
- Verify the backend URL is correct in `constants.ts`
- Test the backend health endpoint

---

## Next Steps

After setting up the backend:

1. ✅ Deploy your Cloudflare Worker
2. ✅ Update `YOUR_BACKEND_URL` in `constants.ts`
3. ✅ Commit and push all changes
4. ✅ Enable GitHub Pages in repo settings
5. ✅ Test cloud sync on your deployed site

Need help? Check the detailed backend documentation at `backend/README.md`.
