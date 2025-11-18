# Deployment Instructions

## Building for Production

To build the application for production deployment:

```bash
npm install
npm run build
```

This will create a `build` folder with all the optimized assets ready for deployment.

## Deployment Options

### To Netlify:
1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify deploy` from the project directory
3. Follow the prompts to deploy to your site or create a new one

### To Vercel:
1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` from the project directory
3. Follow the prompts to complete deployment

### To GitHub Pages:
1. Install the gh-pages package: `npm install --save-dev gh-pages`
2. Add the following to your `package.json`:
   ```json
   {
     "homepage": "https://<username>.github.io/<repository-name>",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
3. Run `npm run deploy`

### To a Web Server:
1. Build the project with `npm run build`
2. Upload the contents of the `build` folder to your web server's document root
3. Ensure your server serves the `index.html` file for all routes (SPA configuration)

## Environment Configuration

The application uses The Movie Database (TMDB) API to fetch movie information.

### API Key:
- Get your free API key from: https://www.themoviedb.org/settings/api
- Enter your API key when prompted in the application interface
- The API key is stored in browser localStorage and is not sent to any other service

## Server Configuration Notes

For serving the application correctly, your web server needs to be configured to serve the `index.html` file for any route, as this is a Single Page Application (SPA).

### Apache (.htaccess):
```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### Nginx:
```
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/build;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## File Structure

The production build includes:
- `index.html` - Main HTML file
- `static/css/` - Optimized CSS files
- `static/js/` - Optimized JavaScript files
- `static/media/` - Image and font assets
- `asset-manifest.json` - Asset mapping
- `manifest.json` - PWA manifest
- `robots.txt` - Crawler instructions

## Performance Tips

- The build includes code splitting for improved initial load times
- Images are loaded lazily to improve performance
- The 3D effects are optimized but may impact performance on older devices