# Troubleshooting: Image Not Displaying

## Quick Fixes (Try These First)

### 1. Hard Refresh Browser
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`
- This clears cached images

### 2. Restart Dev Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"
- Or: Settings → Clear browsing data → Cached images

### 4. Check File Name (Case Sensitivity)
- **Correct:** `pdr.png` (lowercase)
- **Wrong:** `pdr.PNG`, `PDR.png`, `PDR.PNG`
- Windows is case-insensitive, but web servers may be case-sensitive

### 5. Verify File Location
- **Must be in:** `public/images/patterns/pdr.png`
- **NOT in:** `src/images/patterns/` or `images/patterns/`
- The `public/` folder is served directly by Vite

## Detailed Troubleshooting

### Step 1: Verify File Exists
```powershell
Test-Path "public/images/patterns/pdr.png"
# Should return: True
```

### Step 2: Check File Name Case
```powershell
Get-Item "public/images/patterns/pdr.png" | Select-Object Name
# Should show: pdr.png (lowercase)
```

### Step 3: Check File Size
```powershell
Get-Item "public/images/patterns/pdr.png" | Select-Object Length
# Should be > 0 bytes (not empty)
```

### Step 4: Verify JSON Configuration
The pattern should have:
```json
{
  "id": "pattern_pdr",
  "image": "/images/patterns/pdr.png"
}
```

### Step 5: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - `404 Not Found` - file doesn't exist
   - `Failed to load resource` - path issue
   - `CORS error` - server issue

### Step 6: Test Direct URL
Try accessing the image directly:
```
http://localhost:5002/images/patterns/pdr.png
```

If this works, the file is correct but there's a component issue.
If this doesn't work, the file path or server is the issue.

## Common Issues

### Issue 1: File Name Mismatch
**Symptom:** Image exists but doesn't display
**Solution:** 
- Check exact file name matches JSON: `pdr.png`
- Rename if needed: `Rename-Item "pdr.PNG" "pdr.png"`

### Issue 2: Wrong Directory
**Symptom:** 404 error in console
**Solution:**
- File MUST be in: `public/images/patterns/`
- NOT in: `src/` or root directory

### Issue 3: Corrupted Image
**Symptom:** File exists but shows broken image icon
**Solution:**
- Try opening the image in an image viewer
- Re-save the image as PNG
- Check file size (should be > 0 bytes)

### Issue 4: Browser Cache
**Symptom:** Old placeholder or no image
**Solution:**
- Hard refresh: `Ctrl + Shift + R`
- Clear cache completely
- Try incognito/private window

### Issue 5: Dev Server Not Restarted
**Symptom:** Changes not reflected
**Solution:**
- Stop server (Ctrl+C)
- Restart: `npm run dev`
- Wait for "ready" message

## Verification Checklist

- [ ] File exists at: `public/images/patterns/pdr.png`
- [ ] File name is lowercase: `pdr.png` (not `pdr.PNG`)
- [ ] File size > 0 bytes (not empty)
- [ ] JSON has: `"image": "/images/patterns/pdr.png"`
- [ ] Dev server is running
- [ ] Browser cache cleared (hard refresh)
- [ ] Direct URL works: `http://localhost:5002/images/patterns/pdr.png`
- [ ] No console errors (F12 → Console)

## Still Not Working?

1. **Check the exact error in browser console (F12)**
2. **Verify the file can be opened in an image viewer**
3. **Try a different image file to test if it's file-specific**
4. **Check if other images in the same directory work**

## Test with Another Image

To verify the system works:
1. Check if `mu-rhythm.png` displays (if it exists)
2. If other images work, the issue is specific to `pdr.png`
3. If no images work, it's a system configuration issue




