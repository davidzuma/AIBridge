# Environment Configuration Guide

## Overview
MZ Asesoría uses different environment configurations for development and production. This guide explains how to set up and manage environment variables properly.

## File Structure
```
.env.example      # Template with placeholder values
.env.local        # Local development configuration (ignored by git)
.env.production   # Production template (ignored by git)
```

## Environment Variables

### Core Configuration
| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `DATABASE_URL` | Database connection string | SQLite file | PostgreSQL URL |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` | `https://your-domain.vercel.app` |
| `NEXTAUTH_SECRET` | JWT encryption secret | Same value | Same value |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Authentication (Google OAuth)
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### AI Services
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI responses |

### Application Settings
| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | `MZ Asesoría` |
| `APP_VERSION` | Version number | `1.0.0` |
| `DEBUG` | Enable debug logging | `true` (dev), `false` (prod) |
| `PORT` | Development server port | `3000` |

## Setup Instructions

### 1. Local Development
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your actual values
# Make sure to fill in all required variables
```

### 2. Production Deployment
1. Set up PostgreSQL database (recommended: Neon, Supabase)
2. Configure environment variables in Vercel dashboard
3. Update Google OAuth redirect URIs
4. Deploy and run database migrations

## Security Best Practices

### ✅ Do:
- Use `.env.local` for development secrets
- Set production variables in Vercel dashboard
- Use different databases for dev/prod
- Keep `NEXTAUTH_SECRET` consistent across environments
- Add your production domain to Google OAuth settings

### ❌ Don't:
- Commit `.env.local` or `.env.production` with real values
- Use the same database for development and production
- Share API keys in public repositories
- Use development URLs in production

## Database Configuration

### Development (SQLite)
```
DATABASE_URL="file:./prisma/dev.db"
```

### Production (PostgreSQL)
```
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`

## OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add the key to your environment variables

## Troubleshooting

### Common Issues:
1. **Database connection errors**: Check DATABASE_URL format
2. **OAuth redirect errors**: Verify redirect URIs in Google Console
3. **OpenAI API errors**: Validate API key and check usage limits
4. **NextAuth errors**: Ensure NEXTAUTH_URL matches your domain

### Debug Mode:
Set `DEBUG="true"` in development to see detailed error messages and logs.

## Environment Validation

The application validates required environment variables on startup. Missing variables will cause the application to fail with descriptive error messages.

Required variables:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Database Connection](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
