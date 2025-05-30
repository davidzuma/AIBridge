# Vercel Deployment Guide

## Environment Variables Configuration

After deploying to Vercel, you need to configure the following environment variables in your Vercel project dashboard:

### 1. Go to Vercel Dashboard
- Navigate to your project
- Go to Settings → Environment Variables

### 2. Add the following environment variables:

#### Authentication & App Configuration
```
NEXTAUTH_URL = https://your-vercel-app-domain.vercel.app
NEXTAUTH_SECRET = A9VauAFzXb7iYkGuZpe1ZLsbZ2LpTdwsz+Z33NJvrHw=
```

#### Google OAuth Credentials
```
GOOGLE_CLIENT_ID = 551411570887-iqukrvoosa4k79nenavdl258ot5n7su6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
```

#### Database Configuration (Neon PostgreSQL)
```
DATABASE_URL = postgres://neondb_owner:npg_au2yPLDK7OsN@ep-floral-hat-abqhu8vg-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

#### AI Service
```
OPENAI_API_KEY = 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
```

#### Stack Auth (Optional - if using)
```
NEXT_PUBLIC_STACK_PROJECT_ID = d080c319-b1a8-4b88-8c4b-aefc3185dd1b
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY = pck_a51chnw189j4mb2y7h24d4ag8xwqn3nk28z252mb19dhr
STACK_SECRET_SERVER_KEY = ssk_1ppr3sqvfz7qjh2vtc78kzxsm574sxnd8srkrej67t5f0
```

## Important Notes

### 1. Update NEXTAUTH_URL
- Replace `https://your-vercel-app-domain.vercel.app` with your actual Vercel deployment URL
- You can find this in your Vercel project dashboard after deployment

### 2. Update Google OAuth Settings
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services → Credentials
- Edit your OAuth 2.0 Client
- Add your Vercel domain to "Authorized redirect URIs":
  ```
  https://your-vercel-app-domain.vercel.app/api/auth/callback/google
  ```

### 3. Database Considerations
- The current DATABASE_URL points to your Neon PostgreSQL database
- Make sure your Neon database is accessible from Vercel (it should be by default)
- Consider running `npx prisma db push` after deployment to ensure schema is up to date

### 4. Security Best Practices
- Never commit environment variables to your repository
- Use different secrets for production vs development
- Consider rotating your NEXTAUTH_SECRET for production

## Deployment Steps

1. **Fix completed**: Remove secret references from vercel.json ✅
2. **Deploy to Vercel**: 
   ```bash
   vercel --prod
   ```
3. **Configure environment variables** in Vercel dashboard as listed above
4. **Update Google OAuth** redirect URIs with your production domain
5. **Test the deployment** to ensure everything works

## Troubleshooting

If you encounter issues:
- Check Vercel function logs in the dashboard
- Verify all environment variables are set correctly
- Ensure Google OAuth redirect URIs include your production domain
- Check that your database is accessible from Vercel
