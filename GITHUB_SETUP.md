# GITHUB SETUP — Run these commands in your Terminal

# 1. Navigate to the project
cd "/Users/ankitkumar/Downloads/ekadya 2"

# 2. Initialize git
git init

# 3. Stage everything
git add .

# 4. First commit
git commit -m "🌸 Initial commit — Ekadya's magical garden app"

# 5. Create repo on GitHub (requires GitHub CLI — install at https://cli.github.com)
gh repo create ekadya --public --source=. --remote=origin --push

# ── OR if you prefer to do it manually on github.com: ──
# a) Go to https://github.com/new
# b) Name it: ekadya
# c) Keep it Private (recommended — has personal photos)
# d) Do NOT initialize with README (we already have one)
# e) Click "Create repository"
# f) Then run:
#    git remote add origin https://github.com/YOUR_USERNAME/ekadya.git
#    git branch -M main
#    git push -u origin main

# ── IMPORTANT: Never commit .env.local ──
# Your Supabase keys are in .env.local which is already in .gitignore ✅
# Double-check before pushing:
#   cat .gitignore | grep env
