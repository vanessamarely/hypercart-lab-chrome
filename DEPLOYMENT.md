# GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository's Settings tab
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Push your code to the main branch:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

3. **Monitor the deployment:**
   - Go to the "Actions" tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow run
   - Once complete, your site will be available at: `https://[username].github.io/[repository-name]/`

## How it works

- The workflow triggers on pushes to the `main` branch
- It builds the Vite app using `npm run build`
- The built files are deployed to GitHub Pages
- The base path is automatically configured based on your repository name

## Local Development

For local development, the app runs normally without the base path:

```bash
npm run dev
```

## Troubleshooting

- **404 errors**: Make sure GitHub Pages is enabled and set to "GitHub Actions" as the source
- **Assets not loading**: The workflow automatically configures the base path for your repository
- **Build failures**: Check the Actions tab for detailed error logs

## Manual Deployment

You can also trigger a deployment manually:
1. Go to the Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"