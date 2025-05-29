# 🚀 Deployment Checklist for MZChat

## Before Deployment

### 1. Database Setup
- [ ] Create PostgreSQL database (Neon/Supabase/Railway)
- [ ] Note down DATABASE_URL connection string
- [ ] Test database connection

### 2. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project or select existing one
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `https://your-domain.vercel.app/api/auth/callback/google` (production)
- [ ] Note down Client ID and Client Secret

### 3. Environment Variables
- [ ] NEXTAUTH_URL (your production domain)
- [ ] NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET  
- [ ] DATABASE_URL

## Deployment Steps

### 1. Code Preparation
- [ ] Commit all changes: `git add . && git commit -m "Ready for production"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify build works: `npm run build`

### 2. Vercel Deployment
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy and wait for build completion

### 3. Post-Deployment
- [ ] Update Google OAuth authorized URIs with Vercel domain
- [ ] Run database migrations: `npm run db:push`
- [ ] Test authentication flow
- [ ] Login with your Google account
- [ ] Set your account as admin using setup-admin.sql
- [ ] Test both user and reviewer dashboards

## Testing Checklist

### Authentication
- [ ] Google login works
- [ ] Role-based redirects work
- [ ] Logout functionality works
- [ ] Protected routes require authentication

### User Dashboard
- [ ] Can create new consultation
- [ ] Can view consultation history
- [ ] Status updates display correctly
- [ ] Responsive design works on mobile

### Reviewer Dashboard  
- [ ] Can view all consultations
- [ ] Can update consultation status
- [ ] Can add reviewer comments
- [ ] Statistics display correctly

### API Endpoints
- [ ] `/api/chats` - Create/read consultations
- [ ] `/api/admin/chats` - Admin functions
- [ ] `/api/auth/[...nextauth]` - Authentication

## 🎉 Go Live!

Once all items are checked, your MZChat application is ready for production use!
