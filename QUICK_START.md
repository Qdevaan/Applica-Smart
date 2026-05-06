# 🚀 Quick Start Guide

## 1. Set Up Your Backend (Supabase)

This project uses Supabase for its backend (authentication, database).

1.  **Create a Supabase project** at supabase.com.
2.  In your Supabase project, go to **Project Settings > API**.
3.  Create a `.env` file in the root of this project.
4.  Copy your **Project URL** and **anon key** into the `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Run the Frontend

```bash
npm run dev
```

Then open: http://localhost:5173

## What You Can Do Now

### ✅ Working Features:

1. **Browse Landing Page**

   - See beautiful animations
   - Read about features
   - View "How It Works" section

2. **Navigate**

   - Click "Get Started" → Goes to Signup
   - Click "Sign In" → Goes to Login
   - Logo always returns to home

3. **Try Forms** (Note: Won't submit without backend)
   - Go to `/signup` - See validation
   - Go to `/login` - See form layout
   - Type invalid email → See error
   - Type weak password → See strength indicator

### ❌ Won't Work Yet (Needs Backend):

- Actually submitting login/signup forms
- Dashboard access
- Token authentication

## Next: Set Up Backend

Follow `BACKEND_API_GUIDE.md` to create the Express.js API.

### Quick Backend Setup (5 min):

1. Create new folder: `backend/`
2. Initialize: `npm init -y`
3. Install: `npm install express mongoose dotenv bcrypt jsonwebtoken cors`
4. Create `server.js`
5. Set up MongoDB connection
6. Implement `/api/auth/signup` and `/api/auth/login`
7. Run: `node server.js`

Then your frontend will work end-to-end! 🎉

---

**Current Status:** Frontend 100% Complete ✅ | Backend 0% Complete ⏳
