# 🌸 Ekadya — Magical Garden App

A god-level Next.js app celebrating the most precious flower in your family — **Ekadya** 👑

## ✨ Features

- 🎆 **Stunning Hero** — Parallax orbs, animated name reveal, live age counter
- 📸 **Memory Garden** — Masonry photo gallery with lightbox, connected to Supabase Storage
- ⭐ **Milestone Timeline** — Cinematic dark-mode timeline of her journey
- 💌 **Love Letters** — Tilt-card letters from family members
- ⏰ **Live Age Counter** — Real-time ticker counting every second of her life
- 🦋 **Magic Cursor** — Custom cursor that spawns petals and emojis on move
- 🌸 **Floating Petals** — Ambient petals, butterflies and stars raining down
- 🔐 **Admin Panel** — Upload photos, add milestones, write love letters
- 🌐 **Supabase Backend** — Storage + Postgres for all data

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd ekadya
npm install
```

### 2. Set Up Supabase

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.example` — it contains **complete SQL** to run in your Supabase dashboard to create all tables and policies.

### 3. Update Birth Date

In TWO files, update `BIRTH_DATE` to Ekadya's real birth date:
- `src/app/components/HeroSection.tsx` — line 6
- `src/app/components/AgeCounterSection.tsx` — line 4

```typescript
const BIRTH_DATE = new Date('2025-01-15') // ← Change this!
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📸 Uploading Photos from Google Drive

1. Go to `/admin` in your browser
2. Click the **Upload Photos** tab
3. Paste your Google Drive folder link in the Drive input
4. Open the link → Select all photos → Download as ZIP → Extract
5. Drag the extracted photos into the dropzone
6. They'll upload to Supabase and appear in the gallery instantly!

---

## 🗄️ Supabase Setup (Quick Reference)

Run this SQL in your Supabase SQL editor:

```sql
-- Tables
CREATE TABLE milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  emoji TEXT DEFAULT '🌸',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE love_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author TEXT NOT NULL,
  relation TEXT NOT NULL,
  message TEXT NOT NULL,
  color TEXT DEFAULT '#FFD6E0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  type TEXT DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON milestones FOR SELECT USING (true);
CREATE POLICY "Public read" ON love_letters FOR SELECT USING (true);
CREATE POLICY "Public read" ON gallery FOR SELECT USING (true);
CREATE POLICY "Anon insert" ON milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert" ON love_letters FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert" ON gallery FOR INSERT WITH CHECK (true);
```

**Storage Bucket:**
1. Supabase → Storage → New Bucket
2. Name: `ekadya-media`
3. Toggle **Public** ON
4. Add policy: Allow uploads (INSERT for anon)

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your environment variables in Vercel dashboard → Project Settings → Environment Variables.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main page (server component)
│   ├── layout.tsx                  # Root layout + fonts
│   ├── globals.css                 # All animations & design tokens
│   ├── admin/
│   │   └── page.tsx                # Admin panel
│   ├── api/
│   │   └── upload/route.ts         # Server-side upload API
│   └── components/
│       ├── MagicCursor.tsx         # Custom cursor with sparkles
│       ├── FloatingPetals.tsx      # Ambient petal rain
│       ├── Navigation.tsx          # Sticky nav
│       ├── HeroSection.tsx         # Hero + live age stats
│       ├── GallerySection.tsx      # Masonry gallery + lightbox
│       ├── MilestoneTimeline.tsx   # Cinematic timeline
│       ├── LoveLettersSection.tsx  # Tilt letter cards
│       ├── AgeCounterSection.tsx   # Live second-by-second counter
│       └── Footer.tsx              # Magical footer
└── lib/
    └── supabase.ts                 # All Supabase helpers & types
```

---

Made with 💕 for Ekadya — may her world always be magical 🌸
