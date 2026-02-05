# Chat Image Rendering Fix

## Problem
Images attached to chat messages were not rendering properly. Users could attach images, but they would fail to display in the chat window.

## Root Cause
When files were uploaded, the server was returning **relative URLs** like `/uploads/filename.jpg`. The browser would then resolve these relative URLs against the **frontend domain** (e.g., Vercel) instead of the **backend server** (e.g., Render), resulting in 404 errors.

Example:
- Backend returns: `/uploads/1234-image.jpg`
- Frontend is at: `https://neurotrace-academy.vercel.app`
- Browser tries to load: `https://neurotrace-academy.vercel.app/uploads/1234-image.jpg` ❌
- But the file is actually at: `https://neurotrace-academy.onrender.com/uploads/1234-image.jpg` ✅

## Solution

### 1. Server-Side Changes (Fixed Upload Endpoints)

#### Chat Uploads (`server/src/routes/chat.js`)
Updated the `/upload` endpoint to return **absolute URLs** instead of relative paths:

```javascript
// Before
const fileUrl = `/uploads/${req.file.filename}`;

// After
const protocol = req.protocol || 'https';
const host = req.get('host') || process.env.API_URL || 'neurotrace-academy.onrender.com';
const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
```

#### Case Uploads (`server/src/routes/cases.js`)
Applied the same fix to case file uploads:

```javascript
// Before
const fileUrl = `/uploads/cases/${req.file.filename}`;

// After
const protocol = req.protocol || 'https';
const host = req.get('host') || process.env.API_URL || 'neurotrace-academy.onrender.com';
const fileUrl = `${protocol}://${host}/uploads/cases/${req.file.filename}`;
```

### 2. Client-Side Changes (Backward Compatibility)

Updated `MessageBubble.jsx` to handle both absolute and relative URLs for backward compatibility with existing messages:

```javascript
// Added helper function
const getFileUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${apiService.getBaseUrl()}${url}`;
};

// Updated image rendering
<img src={getFileUrl(file.url)} alt="attachment" ... />
```

## Files Modified

### Backend
1. `server/src/routes/chat.js` - Chat file upload endpoint
2. `server/src/routes/cases.js` - Case file upload endpoint

### Frontend
1. `src/components/Chat/MessageBubble.jsx` - Added URL handling for backward compatibility

## Already Handled
These components already had proper URL handling and didn't need changes:
- `src/components/Chat/ChatActiveWindow.jsx` (line 209, 229)
- `src/pages/cases/ShareCase.jsx` (line 413)
- `src/pages/CaseDetail.jsx` (line 164)
- `src/pages/AdminModeration.jsx` (line 363)

## Testing Checklist

After deploying these changes:

- [ ] Upload a new image in public chat - verify it displays
- [ ] Upload a new image in private chat - verify it displays
- [ ] Upload a new image in AI chat - verify it displays
- [ ] Upload a new case with image attachment - verify it displays
- [ ] Verify existing messages with old relative URLs still work (backward compatibility)
- [ ] Test on both desktop and mobile browsers
- [ ] Check browser console for any 404 errors on image URLs

## Deployment Notes

1. **Deploy backend first** - This ensures new uploads get absolute URLs
2. **Deploy frontend** - This provides backward compatibility for old messages
3. No database migration needed - the fix handles both old and new URL formats

## Additional Improvements Made

- Added console logging to track successful file uploads
- Improved error handling and debugging information
- Maintained backward compatibility with existing data

## Environment Requirements

Make sure these environment variables are set correctly:

**Backend:**
- Server should be accessible at the host specified in `req.get('host')`
- `process.env.API_URL` can be set as fallback (e.g., `neurotrace-academy.onrender.com`)

**Frontend:**
- `VITE_API_URL` should point to backend API (e.g., `https://neurotrace-academy.onrender.com/api`)

## How It Works Now

1. User uploads an image in chat
2. Frontend sends file to backend `/api/chat/upload`
3. Backend saves file to `uploads/` directory
4. Backend returns **absolute URL**: `https://neurotrace-academy.onrender.com/uploads/1234-image.jpg`
5. Frontend receives absolute URL and renders image directly
6. Browser loads image from correct backend server ✅

For backward compatibility with old messages:
1. Frontend checks if URL starts with `http`
2. If not, prepends backend base URL
3. This ensures old relative URLs also work correctly
