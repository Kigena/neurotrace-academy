# Admin Setup Guide

## Overview

The case moderation system requires at least one admin user to review and approve submitted cases.

## Making a User an Admin

### ✨ **NEW: UI Method (Easiest)**

**If you already have an admin account**, you can now create other admins from the UI:

1. Log in as an admin
2. Navigate to **Admin Dashboard** → **👥 User Management** tab
3. Find the user you want to promote
4. Click **"Promote to Admin"** button
5. Confirm the action
6. ✅ Done! They are now an admin

**For your FIRST admin user**, use one of the database methods below.

---

## Creating Your First Admin (Database Methods)

Since you need at least one admin to use the UI method, create your first admin using one of these approaches:

### Option 1: MongoDB Compass / Studio 3T

1. Connect to your MongoDB database
2. Navigate to the `users` collection
3. Find the user document you want to make admin
4. Add/Update the `role` field:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save the document

### Option 2: MongoDB Shell

```javascript
// Connect to your database
use neurotrace

// Find your user
db.users.findOne({ email: "your-email@example.com" })

// Update user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

// Verify the update
db.users.findOne({ email: "your-email@example.com" })
```

### Option 3: Mongoose Script (Backend)

Create a temporary file `server/scripts/makeAdmin.js`:

```javascript
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            console.error('❌ User not found');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Get email from command line
const email = process.argv[2];

if (!email) {
    console.error('Usage: node makeAdmin.js user@example.com');
    process.exit(1);
}

makeAdmin(email);
```

Run it:
```bash
cd server
node scripts/makeAdmin.js your-email@example.com
```

## Verifying Admin Access

1. Log out and log back in (to refresh the JWT token with role)
2. Check the navbar - you should see "🛡️ Moderation" link
3. Click it to access the admin dashboard
4. If you see "Access Denied", the role might not be in your session:
   - Clear localStorage: `localStorage.clear()`
   - Log out and log back in

## Admin Dashboard Features

### Access: `/admin/moderation`

The admin dashboard has two main tabs:

### Tab 1: 📋 Case Moderation

**Filter Tabs:**
- **Pending Review** - Cases waiting for approval
- **All Cases** - All cases regardless of status
- **Rejected** - Cases that were rejected

**Case Review:**
1. Click any case to view details
2. Review for PHI (Protected Health Information):
   - Patient names, IDs, MRNs
   - Facility names, addresses
   - Exact dates of birth
   - Provider names
   - Image headers with identifiers
3. Add moderation notes (required for rejection)
4. Approve ✅ or Reject ❌

**Case Statuses:**
- `pending` - Submitted by user, awaiting review
- `published` - Approved and visible to all users
- `rejected` - Rejected due to PHI or other issues
- `draft` - Saved but not submitted
- `archived` - Removed from active listings

### Tab 2: 👥 User Management

**Overview Stats:**
- Total Users count
- Admin Users count
- Regular Users count

**User Table:**
- View all registered users
- See current roles (Admin 👑 or User 👤)
- Join date for each user

**Actions:**
- **Promote to Admin** - Elevate user to admin role
- **Demote to User** - Remove admin privileges
- Cannot change your own role (safety feature)

**How to Create More Admins:**
1. Go to User Management tab
2. Find the user in the table
3. Click "Promote to Admin" button
4. Confirm the action
5. User immediately gains admin access
6. User should log out and back in to see admin UI features

## User Experience

### For Regular Users:

1. Click "Share Case" button
2. See disclaimer modal (must agree to de-identification requirements)
3. Fill out case form (3 steps)
4. Submit case
5. Case status: **Pending** (not visible to other users yet)
6. Receive notification after admin review

### For Admins:

1. See "🛡️ Moderation" in navbar
2. Review pending cases
3. Check for PHI in:
   - Patient information
   - History/medications
   - EEG images (headers!)
4. Approve or reject with notes
5. Approved cases appear in community feed

## Common PHI to Watch For

### ❌ MUST BE REMOVED:
- Patient names (full, first, last, initials)
- Medical record numbers (MRN)
- Date of birth (DOB)
- Full addresses
- Phone numbers
- Social security numbers
- Hospital/facility names
- Doctor/technician names
- Exact dates (convert to relative: "2024" → "Recent")

### ✅ SAFE TO KEEP:
- Age ranges ("8 years", "elderly", "30s")
- Gender (if relevant)
- General location ("Midwest", "Urban area")
- Clinical symptoms
- EEG findings
- Medications (generic names)
- Relative time ("recent onset", "chronic")

## Image Header Guidelines

EEG screenshots often contain PHI in headers:
- Patient name fields
- ID/MRN fields
- Facility names
- Exact timestamps
- Provider names

**Solution:**
- Headers should be cropped
- OR masked with solid color blocks
- Only waveforms and technical annotations visible

## Moderation Notes Examples

### Good Rejection Notes:
```
Patient name visible in image header - please crop/mask before resubmitting.
```

```
Medical record number (MRN: 12345678) found in history section - please remove.
```

```
Exact date of birth included - please convert to age range (e.g., "8 years old").
```

### Good Approval Notes:
```
All PHI properly de-identified. Educational value maintained. Approved for publication.
```

## Security Considerations

1. **Role-based access**: Only users with `role: "admin"` can access moderation
2. **Protected routes**: Backend validates admin status on all moderation endpoints
3. **Audit trail**: Each case tracks `reviewedBy` and `reviewedAt`
4. **JWT tokens**: Include role claim for frontend authorization

## Troubleshooting

### "Access Denied: Admin privileges required"

**Cause**: User doesn't have admin role or token not refreshed

**Fix**:
1. Verify role in database: `db.users.findOne({ email: "user@example.com" })`
2. Should see: `"role": "admin"`
3. Log out and log back in to refresh JWT token
4. Check console: `console.log(JSON.parse(localStorage.getItem('neurotrace_active_session_v1')))`

### Moderation link not showing in navbar

**Cause**: Role not in user object

**Fix**:
1. Check if role is returned from login: Open Network tab → `/api/auth/login` response
2. Should see: `"role": "admin"` in user object
3. If missing, backend might not be returning role - check `auth.js` route

### Cases not loading in moderation dashboard

**Cause**: API endpoint error

**Fix**:
1. Check console for errors
2. Verify backend is running
3. Check Network tab for `/api/cases/moderation` request
4. Verify admin middleware is allowing request

## Future Enhancements

Potential improvements:
- [ ] Email notifications to submitters on approval/rejection
- [ ] Bulk approve/reject
- [ ] Automated PHI scanning (NLP-based)
- [ ] In-app image editor for cropping headers
- [ ] Admin activity log
- [ ] Multiple admin roles (reviewer, approver, super admin)
- [ ] Case edit requests instead of flat rejection
- [ ] Public statistics dashboard (X cases reviewed, Y% approval rate)

## API Endpoints

### Get Cases for Moderation
```
GET /api/cases/moderation?status=pending
Authorization: Bearer {admin_jwt_token}
```

### Moderate Case
```
PUT /api/cases/{caseId}/moderate
Authorization: Bearer {admin_jwt_token}
Body: {
  "status": "published" | "rejected",
  "moderationNotes": "Optional feedback"
}
```

## Database Schema Updates

### User Model
```javascript
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}
```

### CommunityCase Model
```javascript
status: {
  type: String,
  enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
  default: 'pending'  // Changed from 'published'
},
moderationNotes: String,
reviewedBy: ObjectId (ref: User),
reviewedAt: Date
```

## HIPAA Compliance Checklist

For each case review:

- [ ] No patient names or initials
- [ ] No medical record numbers
- [ ] No dates of birth
- [ ] No facility names or addresses
- [ ] No provider names
- [ ] No phone numbers or email addresses
- [ ] No Social Security numbers
- [ ] Age generalized appropriately
- [ ] Images have headers cropped/masked
- [ ] No identifiers visible in image metadata
- [ ] Clinical content preserved for education
- [ ] Educational value maintained

## Questions?

If you encounter issues with the moderation system, check:
1. Browser console for errors
2. Network tab for failed API calls
3. Backend logs on Render dashboard
4. MongoDB connection status

---

**Ready to start moderating?**
1. Make yourself an admin using one of the methods above
2. Log out and back in
3. Navigate to `/admin/moderation`
4. Start reviewing cases!
