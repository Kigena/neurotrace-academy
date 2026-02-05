# Cloudinary Setup Guide - Fix Image Persistence Issue

## 🔴 The Problem

Your images upload successfully and display immediately, but disappear after you leave and come back. This happens because:

**Render's free tier uses ephemeral filesystem:**
- Images saved to `/uploads/` folder
- Server restarts or redeploys → `/uploads/` folder wiped clean
- Images are lost forever

## ✅ The Solution: Cloudinary

Cloudinary provides **persistent cloud storage** that survives server restarts. Images are stored on Cloudinary's servers, not on Render.

### Benefits
- ✅ **Free tier**: 25GB storage, 25GB bandwidth/month
- ✅ **Persistent**: Images never deleted
- ✅ **Fast**: Global CDN delivery
- ✅ **Optimized**: Automatic image compression
- ✅ **Scalable**: Handles growth

## 🚀 Setup Instructions

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Click "Sign Up Free"
3. Fill in your details:
   - Email
   - Password
   - Choose "Developer" plan (free)
4. Verify your email
5. Log in to dashboard

### Step 2: Get API Credentials

Once logged in, you'll see your **Dashboard** with:

```
Cloud name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz-123
```

**Copy these values** - you'll need them next!

### Step 3: Add to Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **backend service**
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add three new variables:

**Variable 1:**
```
Key: CLOUDINARY_CLOUD_NAME
Value: your-cloud-name
```

**Variable 2:**
```
Key: CLOUDINARY_API_KEY
Value: 123456789012345
```

**Variable 3:**
```
Key: CLOUDINARY_API_SECRET
Value: abcdefghijklmnopqrstuvwxyz-123
```

6. Click "Save Changes"
7. **Render will auto-redeploy** with the new variables

### Step 4: Local Development (Optional)

If you want to test locally:

1. Create/update `server/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/neurotrace
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz-123
```

2. Never commit `.env` to Git (already in .gitignore)

### Step 5: Verify Setup

After Render redeploys (2-3 minutes):

1. **Upload an image** to a case or chat
2. **Check the console** - you should see:
   ```
   📎 Case file uploaded successfully to Cloudinary: https://res.cloudinary.com/...
   ```
3. The URL should start with `https://res.cloudinary.com/`
4. **Leave the page** and come back later
5. **Image should still load** ✅

## 🔍 How It Works

### Before (Ephemeral Storage)
```
User uploads image
  ↓
Saved to /uploads/ on Render server
  ↓
Image displays (file exists locally)
  ↓
Server restarts
  ↓
/uploads/ folder wiped
  ↓
Image gone forever ❌
```

### After (Cloudinary)
```
User uploads image
  ↓
Uploaded to Cloudinary servers
  ↓
Cloudinary returns permanent URL
  ↓
URL saved to MongoDB
  ↓
Image displays from Cloudinary
  ↓
Server restarts
  ↓
Image still on Cloudinary
  ↓
Image loads from Cloudinary URL ✅
```

## 📦 What Changed in Code

### New Files
- `server/src/config/cloudinary.js` - Cloudinary configuration
- `server/.env.example` - Environment variables template

### Updated Files
- `server/src/routes/cases.js` - Now uses Cloudinary for case images
- `server/src/routes/chat.js` - Now uses Cloudinary for chat attachments
- `server/package.json` - Added cloudinary packages

### URL Format Change

**Before:**
```
https://neurotrace-academy.onrender.com/uploads/cases/123456-image.png
```

**After:**
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/neurotrace/cases/abcd1234.png
```

## 🧪 Testing Checklist

### Test 1: Upload New Image
- [ ] Go to Share Case page
- [ ] Upload an image
- [ ] Image displays immediately
- [ ] Console shows Cloudinary URL
- [ ] Image URL starts with `https://res.cloudinary.com/`

### Test 2: Persistence
- [ ] Upload image to a case
- [ ] Note the image URL
- [ ] Leave the page (go to home)
- [ ] Come back to the case
- [ ] Image still displays ✅
- [ ] Wait 1 hour and check again
- [ ] Image still displays ✅

### Test 3: Chat Attachments
- [ ] Upload image in chat
- [ ] Image displays
- [ ] Refresh page
- [ ] Image still there ✅

### Test 4: Edit Case
- [ ] Edit a case
- [ ] Remove old broken image
- [ ] Upload new image
- [ ] Save case
- [ ] Image persists after refresh ✅

## 🔧 Troubleshooting

### Error: "File upload failed"

**Possible causes:**
1. Environment variables not set
2. Invalid Cloudinary credentials
3. Cloudinary account not verified

**Solution:**
1. Check Render environment variables
2. Verify values match your Cloudinary dashboard
3. Check Cloudinary account is active
4. Check Render logs for specific error

### Images still use old URLs

**Cause:** Old images in database still have Render URLs

**Solution:**
1. Old images will remain broken (can't fix retroactively)
2. Use the Edit Case feature to:
   - Remove broken images
   - Re-upload to Cloudinary
3. New uploads will work correctly

### Upload is slow

**Cause:** Uploading to cloud takes longer than local disk

**Solution:**
- This is normal (usually 1-3 seconds)
- Cloudinary optimizes images automatically
- Faster loading for users (CDN)
- Worth the small upload delay

### "Missing credentials" error in logs

**Cause:** Environment variables not set or typo

**Solution:**
```bash
# Check Render logs for:
Cloud name: undefined
API Key: undefined

# This means env vars not set properly
# Double-check spelling in Render:
CLOUDINARY_CLOUD_NAME (not CLOUD_NAME)
CLOUDINARY_API_KEY (not API_KEY)
CLOUDINARY_API_SECRET (not SECRET)
```

### Images not optimized

**Cause:** Want to change optimization settings

**Solution:**
Edit `server/src/config/cloudinary.js`:
```javascript
transformation: [
    { width: 1200, crop: 'limit' }, // Max width 1200px
    { quality: 'auto' }, // Auto quality
    { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
]
```

## 📊 Cloudinary Dashboard

### Useful Features

**1. Media Library**
- View all uploaded images
- See storage usage
- Delete unwanted files

**2. Usage Stats**
- Storage used
- Bandwidth used
- Transformations used

**3. Folders**
Your images are organized:
```
neurotrace/
  ├── cases/      (case attachments)
  └── chat/       (chat attachments)
```

**4. Optimize Storage**
If you run out of free tier:
- Delete unused images
- Upgrade plan ($99/year)
- Use smaller transformations

## 🎯 Free Tier Limits

**Cloudinary Free Tier:**
- 25 GB storage
- 25 GB bandwidth/month
- 25 credits/month (transformations)
- Max file size: 10MB (we limit to 10MB)

**Estimated Capacity:**
- ~10,000 high-quality images (2.5MB each)
- OR ~25,000 optimized images (1MB each)
- Should be plenty for a growing platform

**If you exceed limits:**
- Cloudinary will email you
- Uploads may fail
- Options:
  1. Delete old images
  2. Upgrade to paid plan
  3. Implement image cleanup policy

## 📝 Best Practices

### 1. Image Guidelines for Users
- Use reasonable image sizes (< 5MB recommended)
- JPG for photos, PNG for screenshots
- Cloudinary auto-optimizes anyway

### 2. Cleanup Strategy
Consider implementing:
- Delete images when case is deleted
- Archive old cases (move to separate folder)
- Compression before upload

### 3. Security
- Never expose API secret in frontend
- Keep in Render environment variables only
- API secret is in .gitignore

### 4. Monitoring
- Check Cloudinary dashboard monthly
- Monitor storage usage
- Watch for unusual activity

## 🔄 Migration from Old Images

**What happens to existing images?**
- Old URLs (`/uploads/...`) → Already broken ❌
- New uploads → Cloudinary URLs ✅

**How to fix old cases:**
1. Use Edit Case feature
2. Remove broken attachments
3. Re-upload images
4. Save case
5. Images now persistent ✅

**Bulk fix (if needed):**
```javascript
// Can create admin script to migrate
// But easier to manually fix as needed
```

## 🆘 Support

**Cloudinary Support:**
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com
- Community: https://community.cloudinary.com

**Common Issues:**
- Upload fails → Check credentials
- Slow uploads → Normal (cloud storage)
- Old images broken → Use Edit Case to re-upload
- Quota exceeded → Check dashboard usage

## ✅ Success Indicators

You'll know it's working when:
- ✅ New uploads show Cloudinary URLs
- ✅ Images persist after server restart
- ✅ Images load from different locations (CDN)
- ✅ Console shows "uploaded to Cloudinary"
- ✅ Can close page and images still there

## 🎉 Benefits After Setup

1. **Reliability**: Images never disappear
2. **Performance**: Fast global CDN
3. **Scalability**: Handles traffic spikes
4. **Optimization**: Auto-compressed images
5. **Cost**: Free for reasonable usage
6. **Features**: Transformations, effects, etc.

## 🔜 Future Enhancements

Possible improvements:
- Image cropping/editing UI
- Automatic thumbnails
- Lazy loading
- Progressive images
- Video support
- PDF previews

All supported by Cloudinary!
