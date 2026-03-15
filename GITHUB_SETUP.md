# GitHub Setup — Manual Method (no GitHub CLI needed)

## Step 1 — Initialize git locally (run in Terminal)

cd "/Users/ankitkumar/Downloads/ekadya 2"
git init
git add .
git commit -m "🌸 Initial commit — Ekadya's magical garden app"

## Step 2 — Create the repo on GitHub (in your browser)

1. Go to → https://github.com/new
2. Fill in:
   - Repository name: ekadya
   - Description: 🌸 A magical world for our little garden princess
   - Visibility: ● Private  ← important, has personal photos
   - ❌ Do NOT check "Add a README file"
   - ❌ Do NOT check "Add .gitignore"
   - ❌ Do NOT check "Choose a license"
3. Click "Create repository"

## Step 3 — Connect local repo to GitHub and push (run in Terminal)

git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ekadya.git
git branch -M main
git push -u origin main

# Replace YOUR_GITHUB_USERNAME with your actual GitHub username.
# GitHub will ask for your username + password (use a Personal Access Token as password).

## How to get a Personal Access Token (if asked)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → check "repo" scope → copy the token
3. Use that token as your password when git asks

## Future pushes (after any changes)
git add .
git commit -m "describe what you changed"
git push
