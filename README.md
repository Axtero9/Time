# ⏳ Time Moves Slow — Notion-Inspired Collaborative Memory Capsules

A time capsule web application inspired by Notion's typography, aesthetics, and user experience. Create memory boxes, lock photos and videos inside until the duration finishes, unlock early through unanimous member consensus, and have **Google Gemini AI** automatically curate your memories into beautiful themed chapters and nostalgic stories.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAxtero9%2FTime&env=VITE_GEMINI_API_KEY,VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

---

## ✨ Features

- **Notion Design System**:
  - Exact Notion typography with dynamic font switcher (Sans `Inter`, Serif `Source Serif 4`, Mono `JetBrains Mono`).
  - Light and Dark mode themes.
  - Page covers with aesthetic presets, customizable emoji icons with Notion Emoji Picker.
  - Database views: **Gallery View 🖼️**, **Timeline View ⏱️**, and **All Files 📁**.
- **Box Creation Flow**:
  - Name your box and select an emoji.
  - Choose durations: 1 Month, 3 Months, 6 Months, 1 Year, or Custom Days.
  - Social Choice: **Stay Alone 👤** or **Invite Friends 👥** (manage avatars, member rosters, invite links).
- **Sealed Vault & Hidden Media**:
  - Photos and videos uploaded into the box remain strictly encrypted and hidden behind frosted mystery cards until the duration finishes.
  - Live ticking countdown timer.
- **Unanimous Consensus Early Unlock**:
  - *"Show all the pictures and videos before the duration if all the people in the box agree."*
  - Interactive voting system with member agreement status. If 100% of members agree, the vault unseals early with confetti!
- **Gemini AI Memory Curation (Google Gemini 2.5 / 3.6 Flash)**:
  - When unlocked, Gemini analyzes media, timestamps, and captions.
  - Automatically creates titled chapters (e.g. *"🌅 Horizons & Coastal Bridges"*, *"🍕 Late Night Feasts & Laughter"*), generates nostalgic narratives, and writes an overarching retrospective story.
- **Supabase Backend & Authentication**:
  - Real PostgreSQL database (`profiles`, `boxes`, `box_members`, `box_media`) with Row Level Security (RLS).
  - Notion-styled Auth Modal for email/password registration and sign-in.
  - User profiles with avatars and session persistence.
- **Fully Responsive**:
  - Optimized across mobile phones, tablets, foldables, laptops, and ultra-wide desktops.
  - Off-canvas slide-out drawer on mobile with touch-friendly tap targets.

---

## 🚀 One-Click Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository: **`Axtero9/Time`**.
3. Under **Environment Variables**, add the following 3 variables:

| Variable Name | Description | Value |
| :--- | :--- | :--- |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | `your_gemini_api_key` |
| `VITE_SUPABASE_URL` | Supabase Project URL | `your_supabase_project_url` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `your_supabase_anon_key` |

4. Click **Deploy**. Vercel will build and launch your application globally!

---

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Axtero9/Time.git
   cd Time
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini and Supabase API keys to `.env`.

4. Start dev server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8
- **Styling**: Pure Notion Vanilla CSS Design System (`src/styles/notion.css`)
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth)
- **AI Engine**: Google Gemini API (`gemini-3.6-flash` / `gemini-2.5-flash`)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
