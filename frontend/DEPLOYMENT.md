# RestMan Deployment Guide 🚀

This guide will help you deploy RestMan to production using Vercel.

## Pre-deployment Checklist

- [x] Build passes without errors (`npm run build`)
- [x] All TypeScript errors resolved
- [x] PWA manifest configured
- [x] Environment variables prepared
- [x] README documentation complete
- [x] Role-based access control implemented
- [x] Mobile-responsive design verified

## Environment Variables

Create these environment variables in your Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Deploy to Vercel

### Option 1: Deploy via CLI (Recommended)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to preview**:
   ```bash
   npm run deploy:preview
   ```
   - Follow the prompts
   - Select your account
   - Link to existing project or create new
   - Configure project settings

3. **Deploy to production**:
   ```bash
   npm run deploy
   ```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy!

### Option 3: Deploy via Git

```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial RestMan deployment"

# Add Vercel git remote
git remote add vercel https://vercel.com/git/your-project

# Push to deploy
git push vercel main
```

## Post-deployment Setup

### 1. Configure Custom Domain (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

### 2. Set up Database
- Create a Supabase project at [supabase.com](https://supabase.com)
- Run the database migrations (see `database/migrations/`)
- Update environment variables with production values

### 3. Enable Analytics (Optional)
- Go to Project Settings → Analytics
- Enable Vercel Analytics
- Or add Google Analytics ID to environment variables

### 4. Monitor Performance
- Check Vercel dashboard for:
  - Build times
  - Function execution
  - Error logs
  - Performance metrics

## Production URLs

After deployment, your app will be available at:

- **Preview**: `https://restman-[branch]-[username].vercel.app`
- **Production**: `https://restman.vercel.app` (or your custom domain)

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### Runtime Errors
- Check function logs
- Verify API endpoints
- Test database connections

### Performance Issues
- Enable caching headers
- Optimize images
- Use Vercel Edge Functions for better performance

## Security Checklist

- [ ] Environment variables are properly secured
- [ ] API routes have authentication
- [ ] CORS headers configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation in place

## Support

For issues or questions:
- Check [Vercel Documentation](https://vercel.com/docs)
- Open an issue on GitHub
- Contact support@restman.app

---

Happy deploying! 🎉 