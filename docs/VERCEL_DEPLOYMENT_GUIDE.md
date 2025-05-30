# 🚀 MZ Asesoría - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Step 1: Set Up Production Database**

Choose one of these PostgreSQL providers:

#### **Option A: Neon (Recommended - Free tier)**
1. Go to [neon.tech](https://neon.tech)
2. Create account and new project: "mz-asesoria"
3. Copy connection string (looks like: `postgresql://user:pass@host/db`)

#### **Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string

#### **Option C: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string

### ✅ **Step 2: Update Google OAuth Settings**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Go to **APIs & Services → Credentials**
4. Edit your OAuth 2.0 Client
5. Add **Authorized redirect URIs**:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```

### ✅ **Step 3: Deploy to Vercel**

#### **Method 1: Vercel CLI (Quick)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# Project name: mz-asesoria
# Directory: ./
# Framework: Next.js
```

#### **Method 2: GitHub + Vercel Dashboard**
```bash
# Push to GitHub
git add .
git commit -m "Ready for production deployment"
git push origin main

# Then go to vercel.com/dashboard
# Click "New Project"
# Import from GitHub
```

### ✅ **Step 4: Configure Environment Variables in Vercel**

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```bash
DATABASE_URL=postgresql://your-neon-connection-string
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=A9VauAFzXb7iYkGuZpe1ZLsbZ2LpTdwsz+Z33NJvrHw=
GOOGLE_CLIENT_ID=551411570887-iqukrvoosa4k79nenavdl258ot5n7su6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
OPENAI_API_KEY=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
```

### ✅ **Step 5: Initialize Production Database**

After deployment, run these commands locally with your production DATABASE_URL:

```bash
# Set production database URL temporarily
export DATABASE_URL="your-production-database-url"

# Push schema to production database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### ✅ **Step 6: Create Admin User in Production**

**Option A: Using Database Console**
```sql
-- Run in your database console (Neon/Supabase)
INSERT INTO "User" (id, name, email, role, "isPremium", "createdAt", "updatedAt") 
VALUES (
  'admin-prod-1', 
  'David Zumaquero', 
  'david.zumaquero@energyai.berlin', 
  'revisor', 
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET 
  role = 'revisor', 
  "isPremium" = true,
  "updatedAt" = CURRENT_TIMESTAMP;
```

**Option B: Using Prisma Studio**
```bash
# Open Prisma Studio for production
DATABASE_URL="your-production-url" npx prisma studio
# Manually create users through the web interface
```

---

## 🎯 **Quick Deployment Commands**

```bash
# 1. Deploy to Vercel
vercel

# 2. Set up production database (after getting connection string)
export DATABASE_URL="your-production-db-url"
npx prisma db push

# 3. Test deployment
curl https://your-project-name.vercel.app/api/auth/session
```

---

## 🌐 **Post-Deployment Verification**

### Test these features:
1. ✅ **Login**: Google OAuth should work
2. ✅ **AI Responses**: Submit a consultation
3. ✅ **Premium Features**: Test review requests
4. ✅ **Reviewer Dashboard**: Access with admin account

### Common Issues & Solutions:

**❌ OAuth Error**: Update redirect URIs in Google Console
**❌ Database Error**: Check connection string and run migrations
**❌ Build Error**: Clear `.next` folder and redeploy
**❌ 500 Error**: Check Vercel function logs

---

## 🎉 **Success!**

Your **MZ Asesoría - Sistema de consultas Fiscales y Laborales** is now live!

- **Frontend**: https://your-project-name.vercel.app
- **Admin**: Login with david.zumaquero@energyai.berlin
- **Monitoring**: Check Vercel dashboard for analytics

---

## 🔧 **Optional: Custom Domain**

1. Go to Vercel → Settings → Domains
2. Add your domain (e.g., `mz-asesoria.com`)
3. Update `NEXTAUTH_URL` environment variable
4. Update Google OAuth redirect URIs
