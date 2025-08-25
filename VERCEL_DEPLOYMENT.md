# Vercel Deployment Guide

## 🚀 Quick Deploy

### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vue.js and configure build settings

### Method 2: Manual Deploy
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Follow the prompts

## ⚙️ Configuration

### Build Settings (Auto-configured)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### Environment Variables
Set these in Vercel Dashboard > Settings > Environment Variables:

```
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=Book Shop
NODE_ENV=production
```

### Custom Domain
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🔧 Files Configured for Vercel

- ✅ `vercel.json` - Routes and caching
- ✅ `vite.config.js` - Build optimization  
- ✅ `.env.vercel` - Environment template
- ✅ Router - SPA routing support

## 🐛 Troubleshooting

### 404 on Direct URL Access
- ✅ Already fixed with `vercel.json` rewrites

### Build Errors
1. Check Node.js version (requires >=16)
2. Clear cache: `npm run build --force`
3. Check environment variables

### API Connection Issues
1. Verify `VITE_API_URL` in environment variables
2. Check CORS settings on your API
3. Ensure API is accessible from Vercel domains

## 📦 Performance Optimization

- Chunk splitting configured
- Static assets caching (1 year)
- Gzip compression enabled
- Tree shaking enabled

## 🔄 Auto-Deployment

Once connected to GitHub:
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Deploy preview URLs
- Pull requests → Deploy preview for testing
