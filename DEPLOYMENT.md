# Deployment Guide for Namecheap and Other Hosting Services

## Quick Start for Static Hosting

Your AutoPro website is ready to deploy! Here's how to get it online:

## Step 1: Build Your Website

Run this command in your terminal:
```bash
npm run build
```

This creates a `dist/` folder with all your website files optimized for production.

## Step 2: Deploy to Namecheap (or similar hosting)

### Using Namecheap cPanel:

1. **Log into cPanel**
   - Go to your Namecheap account
   - Click "Go to cPanel" for your hosting account

2. **Open File Manager**
   - Find "File Manager" in cPanel
   - Navigate to `public_html` folder

3. **Upload Your Files**
   - Delete any existing files in `public_html` (if this is a new site)
   - Click "Upload" button
   - Upload ALL files from your `dist/` folder
   - Or compress the `dist/` folder to a .zip file and upload, then extract

4. **Configure Your Domain**
   - Your website should now be live at your domain!
   - If using a subdomain, navigate to that folder instead

### Important: .htaccess Configuration

Since this is a Single Page Application (SPA), you need to tell the server to redirect all requests to index.html. Create a `.htaccess` file in your `public_html` folder with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Alternative: Deploy to Netlify (Easier Option)

Netlify is **free** and **very easy** - perfect for static sites:

1. **Sign up at [netlify.com](https://netlify.com)** (free)

2. **Drag and drop your `dist/` folder** onto Netlify's dashboard

3. **Done!** Your site is live with a free URL like `your-site.netlify.app`

4. **Add your custom domain** (optional):
   - In Netlify, go to Site Settings → Domain Management
   - Add your custom domain (the one you bought from Namecheap)
   - Follow Netlify's instructions to update your DNS settings

### Benefits of Netlify:
- Free SSL certificate (HTTPS)
- Automatic deployments
- Fast global CDN
- Easy domain setup

## Updating Your Website

Whenever you make changes:

1. Edit the files locally
2. Run `npm run build`
3. Re-upload the `dist/` folder (or drag to Netlify)

## Managing Your Inventory

To add or update vehicles:

1. **Edit** `client/src/data/vehicles.ts`
2. **Update** vehicle information (price, images, descriptions)
3. **Build** with `npm run build`
4. **Re-upload** the new `dist/` folder

## Adding New Car Images

1. **Save** your car images to `attached_assets/` folder
2. **Import** them in `vehicles.ts`:
   ```typescript
   import newCar from '@assets/new-car-image.jpg';
   ```
3. **Use** in vehicle object:
   ```typescript
   {
     id: 11,
     name: 'New Car Model',
     image: newCar,
     // ... other properties
   }
   ```
4. **Rebuild** and re-upload

## Troubleshooting

**Problem**: Page shows 404 when I refresh or navigate directly to a URL

**Solution**: Add the `.htaccess` file (shown above) for Apache servers, or configure your hosting's URL rewrites

**Problem**: Images not loading

**Solution**: Make sure all files from the `dist/` folder are uploaded, including the `assets/` subdirectory

**Problem**: Styles look broken

**Solution**: Check that your domain/hosting is serving files correctly. Clear your browser cache and try again.

## Cost Estimate

- **Namecheap Hosting**: ~$3-5/month (Stellar shared hosting)
- **Domain**: ~$10-15/year
- **Netlify**: FREE (for static sites)
- **Vercel**: FREE (for static sites)

## Recommended Approach

For easiest deployment:
1. Use **Netlify** for free hosting (no server management needed)
2. Use your **Namecheap domain** with Netlify
3. Enjoy automatic HTTPS and global CDN

This gives you the best of both worlds: professional domain from Namecheap + easy hosting from Netlify!

## Need Help?

If you need to make this website updateable through an admin panel (Content Management System), we can add that functionality later. For now, this approach keeps it simple and easy to maintain.
