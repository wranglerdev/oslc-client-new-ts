# Documentation Deployment Guide

This guide explains how to deploy the OSLC Client documentation to GitHub Pages.

## Overview

The documentation is built using **Docusaurus** and automatically deployed to GitHub Pages at:

```
https://YOUR_USERNAME.github.io/oslc-client-new-ts/
```

## Prerequisites

1. GitHub repository for this project
2. GitHub Pages enabled in repository settings
3. Node.js 18+ installed locally (for local development)

## Step 1: Configure GitHub Repository

### Update Configuration

Before deploying, update `website/docusaurus.config.ts`:

```typescript
// Replace YOUR_USERNAME with your actual GitHub username
url: 'https://YOUR_USERNAME.github.io',
organizationName: 'YOUR_USERNAME',
projectName: 'oslc-client-new-ts',
```

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**
4. Save changes

## Step 2: Automatic Deployment

The documentation is automatically deployed when you push changes to the `main` branch.

### GitHub Actions Workflow

The workflow file is located at `.github/workflows/deploy-docs.yml` and triggers on:

- Pushes to `main` branch affecting `website/` or `docs/` directories
- Manual workflow dispatch from GitHub Actions tab

### Deployment Process

1. Push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Update documentation"
   git push origin main
   ```

2. GitHub Actions will:
   - Build the Docusaurus site
   - Deploy to GitHub Pages
   - Make it available at your GitHub Pages URL

3. Check deployment status:
   - Go to **Actions** tab in your repository
   - View the "Deploy Documentation to GitHub Pages" workflow

## Step 3: Manual Deployment (Alternative)

You can also deploy manually using the Docusaurus CLI:

### Configure Git Credentials

```bash
# Set your Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Deploy

```bash
cd website

# Set environment variables
GIT_USER=YOUR_USERNAME npm run deploy
```

This will:
- Build the site
- Push to `gh-pages` branch
- Deploy to GitHub Pages

## Step 4: Verify Deployment

After deployment (automatic or manual):

1. Wait 1-2 minutes for GitHub Pages to update
2. Visit: `https://YOUR_USERNAME.github.io/oslc-client-new-ts/`
3. Verify:
   - Site loads correctly
   - Navigation works
   - Code copy buttons are present
   - Links are not broken

## Local Development

### Install Dependencies

```bash
cd website
npm install
```

### Start Development Server

```bash
npm start
```

- Opens browser at `http://localhost:3000`
- Live reload on file changes
- See changes instantly

### Build Locally

```bash
npm run build
```

- Generates static files in `website/build/`
- Test production build locally:
  ```bash
  npm run serve
  ```

## Updating Documentation

### Update Markdown Files

1. Edit files in `docs/` directory (main source)
2. Copy to `website/docs/`:
   ```bash
   cp docs/*.md website/docs/
   cp docs/api/*.md website/docs/api/
   ```
3. Commit and push - auto-deploys

### Update Sidebar Navigation

Edit `website/sidebars.ts` to change navigation structure.

### Update Site Configuration

Edit `website/docusaurus.config.ts` for:
- Site title and tagline
- Navigation items
- Footer links
- Theme settings

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs:**
1. Go to **Actions** tab
2. Click the failed workflow
3. Review error messages

**Common issues:**
- Wrong `url` or `baseUrl` in config
- Build errors (run `npm run build` locally)
- Node.js version mismatch

### Site Not Updating

1. Clear browser cache (Ctrl+Shift+R)
2. Wait a few minutes (GitHub Pages cache)
3. Check if workflow succeeded in Actions tab
4. Verify GitHub Pages source is "GitHub Actions"

### 404 Errors

**Likely causes:**
- Incorrect `baseUrl` in `docusaurus.config.ts`
- Should be `/oslc-client-new-ts/` for project pages
- Should be `/` for user/organization pages (username.github.io repo)

**Fix:**
```typescript
// For project pages (most common)
baseUrl: '/oslc-client-new-ts/',

// For user pages (username.github.io)
baseUrl: '/',
```

### Broken Links

Run link checker locally:
```bash
cd website
npm run build
npx docusaurus serve
# Test all links manually or use a link checker tool
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `website/static/`:
   ```
   echo "docs.yourdomian.com" > website/static/CNAME
   ```

2. Configure DNS:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

3. Update `docusaurus.config.ts`:
   ```typescript
   url: 'https://docs.yourdomain.com',
   baseUrl: '/',
   ```

4. In GitHub Settings → Pages:
   - Enter your custom domain
   - Enforce HTTPS

## Features

### Enabled by Default

✅ **Code copy buttons** - Click to copy any code block
✅ **Dark mode** - Automatic based on system preferences
✅ **Responsive design** - Mobile-friendly
✅ **Search** - Built-in search functionality
✅ **Syntax highlighting** - TypeScript, JavaScript, Bash, JSON, XML

### Additional Configuration

To enable Algolia DocSearch (advanced search):

1. Apply at [DocSearch](https://docsearch.algolia.com/)
2. Add to `docusaurus.config.ts`:
   ```typescript
   themeConfig: {
     algolia: {
       appId: 'YOUR_APP_ID',
       apiKey: 'YOUR_API_KEY',
       indexName: 'YOUR_INDEX_NAME',
     },
   }
   ```

## Maintenance

### Keep Docusaurus Updated

```bash
cd website
npm update @docusaurus/core @docusaurus/preset-classic
```

### Monitor Build Times

Check GitHub Actions for build duration. If slow:
- Enable build caching (already configured)
- Consider optimizing large images

## Resources

- **GitHub Actions**: `https://github.com/YOUR_USERNAME/oslc-client-new-ts/actions`
- **GitHub Pages**: `https://YOUR_USERNAME.github.io/oslc-client-new-ts/`
- **Docusaurus Docs**: https://docusaurus.io/
- **GitHub Pages Docs**: https://docs.github.com/en/pages

## Support

If deployment issues persist:

1. Open an issue in the repository
2. Check Docusaurus documentation
3. Review GitHub Actions logs
4. Test build locally first

---

**Quick Reference:**

```bash
# Local development
cd website && npm start

# Build locally
cd website && npm run build

# Manual deploy
cd website && GIT_USER=YOUR_USERNAME npm run deploy

# Copy updated docs
cp docs/*.md website/docs/ && cp docs/api/*.md website/docs/api/
```
