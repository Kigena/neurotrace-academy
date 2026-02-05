# Quick Start: Fix Image Persistence (5 Minutes)

## The Problem
✅ Images upload successfully  
✅ Images display immediately  
❌ Images disappear after leaving the page  

**Why?** Render's free tier has ephemeral storage - files deleted on server restart.

## The Solution: Cloudinary (5-Minute Setup)

### Step 1: Create Cloudinary Account (2 minutes)
1. Go to https://cloudinary.com/
2. Click "Sign Up Free"
3. Enter email, password, choose "Developer" plan
4. Verify email and log in

### Step 2: Get Your Credentials (30 seconds)
On your Cloudinary dashboard, copy these 3 values:
```
Cloud name: _____________
API Key: _____________
API Secret: _____________
```

### Step 3: Add to Render (2 minutes)
1. Go to https://dashboard.render.com/
2. Click your **backend service**
3. Click "Environment" tab
4. Click "Add Environment Variable" (do this 3 times):

```
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key  
CLOUDINARY_API_SECRET = your-api-secret
```

5. Click "Save Changes"
6. Render will auto-redeploy (~2-3 minutes)

### Step 4: Test (1 minute)
After deployment completes:
1. Upload an image to a case
2. Check console - should see: `📎 uploaded to Cloudinary: https://res.cloudinary.com/...`
3. Leave the page and come back
4. ✅ Image still there!

## That's It!

All new images will now persist forever. Old broken images can be fixed using the Edit Case feature.

**Free Tier:** 25GB storage, 25GB bandwidth = ~10,000+ images

For detailed instructions, see `CLOUDINARY_SETUP_GUIDE.md`
