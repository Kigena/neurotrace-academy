# Case Editing Feature

## Overview
Users can now edit their own cases and admins can edit any case. This allows fixing errors, updating information, and re-uploading images that failed to render.

## Features

### 1. Edit Your Own Cases
**Who:** Case authors (the user who created the case)

**Permissions:**
- ✅ Edit title, history, patient info
- ✅ Update findings and classifications
- ✅ Add/remove attachments
- ✅ Update tags
- ✅ Modify medications
- ❌ Cannot change author
- ❌ Cannot edit other users' cases

### 2. Admin Edit Any Case
**Who:** Administrators

**Permissions:**
- ✅ Edit ANY case (regardless of author)
- ✅ Fix data quality issues
- ✅ Update broken images
- ✅ Correct information
- ✅ Full editing capabilities

## How to Edit a Case

### For Case Authors

**Method 1: From Case Detail Page**
1. Go to your case (`/cases/{id}`)
2. Look for "Edit" button (top right, below author info)
3. Click "Edit" button
4. Update any information
5. Click "Update Case"

**Method 2: From Cases List**
- Feature coming soon: Edit button on case cards

### For Admins

**Method 1: From Admin Dashboard**
1. Go to Admin Dashboard
2. Select case to review
3. Click "✏️ Edit Case Details" button
4. Update case information
5. Click "Update Case"

**Method 2: From Case Detail Page**
- Same as case authors (admin sees Edit button on all cases)

## Editing Workflow

### Step 1: Basic Information
Update:
- Case title
- Patient age (number and unit: years/months/days)
- Gender
- Handedness

**Navigation:**
- Click "Cancel" to abort and return to case
- Click "Next" to proceed to clinical details

### Step 2: Clinical Details
Update:
- Clinical history / HPI (required)
- Medications (comma-separated)
- EEG Findings:
  - Background activity
  - Interictal findings
  - Ictal findings
  - Classification

**Navigation:**
- Click "Back" to return to step 1
- Click "Next" to proceed to attachments

### Step 3: Attachments & Tags

**Current Attachments:**
- View all existing attachments
- See image previews
- Click "Remove" to delete an attachment

**Add New Attachments:**
- Click upload area
- Select image or PDF
- Preview shows before adding
- Click "Add File" to upload
- Repeat for multiple files

**Update Tags:**
- Edit comma-separated tags
- Example: `#Seizure, #Pediatric, #Artifact`

**Final Actions:**
- Click "Back" to return to step 2
- Click "Update Case" to save all changes

## Use Cases

### Fix Failed Images
**Problem:** Images uploaded but don't display

**Solution:**
1. Edit the case
2. Go to Step 3 (Attachments)
3. Remove broken attachments
4. Re-upload images
5. Save case
6. Images now display correctly with absolute URLs

### Update Information
**Problem:** Made a typo or want to add more detail

**Solution:**
1. Edit the case
2. Navigate to relevant step
3. Update the information
4. Save changes
5. Case displays updated information

### Add Missing Attachments
**Problem:** Forgot to include important EEG traces

**Solution:**
1. Edit the case
2. Go to Step 3
3. Upload additional files
4. Save case
5. New attachments appear

### Correct Clinical Details
**Problem:** Need to update findings or classification

**Solution:**
1. Edit the case
2. Go to Step 2
3. Update findings sections
4. Save changes
5. Case reflects accurate information

## Technical Implementation

### Frontend

#### EditCase Component (`src/pages/cases/EditCase.jsx`)
**Features:**
- Loads existing case data
- Permission check (owner or admin)
- 3-step form like ShareCase
- Add/remove attachments
- Form validation
- Progress indicator

**Key Functions:**
```javascript
loadCase() - Fetch existing case and populate form
handleChange() - Update form fields
handleAddAttachment() - Upload new files
handleRemoveAttachment() - Delete existing attachments
handleSubmit() - Save all changes
```

**State Management:**
```javascript
formData - All case fields
file - Current file being uploaded
filePreview - Image preview before upload
loading - Initial data loading
isSubmitting - Save in progress
```

#### CaseDetail Component Updates
**Added:**
- Permission check: `canEdit` (owner or admin)
- Edit button in CommunityCaseView header
- Navigate to `/cases/:id/edit`

#### AdminModeration Updates
**Added:**
- "✏️ Edit Case Details" button
- Navigate to edit page from moderation panel
- Quick access for admin edits

#### App Router (`src/App.jsx`)
**New Route:**
```javascript
<Route path="/cases/:id/edit" element={
  <ProtectedRoute>
    <EditCase />
  </ProtectedRoute>
} />
```

### Backend

#### Update Endpoint (`server/src/routes/cases.js`)
**PUT `/api/cases/:id`**

**Security:**
- Requires authentication
- Checks ownership (author) OR admin role
- Returns 403 if unauthorized

**Validation:**
- Case exists (404 if not found)
- Title and history required
- Sanitizes patient info

**Updates:**
- All case fields
- Preserves comments (not editable)
- Updates timestamp
- Maintains author (cannot change)

**Response:**
- Returns updated case with populated author
- Includes all fields for immediate display

#### CaseService Update (`src/services/caseService.js`)
**New Method:**
```javascript
async updateCase(id, caseData)
- Calls PUT /api/cases/:id
- Returns updated case
- Error handling
```

## Permissions Matrix

| Action | Case Author | Other User | Admin |
|--------|-------------|------------|-------|
| View Edit Button | ✅ | ❌ | ✅ |
| Access Edit Page | ✅ | ❌ | ✅ |
| Update Title | ✅ | ❌ | ✅ |
| Update History | ✅ | ❌ | ✅ |
| Update Findings | ✅ | ❌ | ✅ |
| Add Attachments | ✅ | ❌ | ✅ |
| Remove Attachments | ✅ | ❌ | ✅ |
| Change Author | ❌ | ❌ | ❌ |
| Delete Comments | ❌ | ❌ | ✅ |

## Visual Features

### Edit Button
**On Case Detail Page:**
- Located in top right header area
- Indigo button with pencil icon
- Only visible to owner or admin
- Text: "Edit"

**On Admin Panel:**
- Located above Danger Zone
- Full width button
- Blue background
- Text: "✏️ Edit Case Details"

### Edit Page
**Progress Indicators:**
- 3 numbered circles (1, 2, 3)
- Purple when active/completed
- Gray when not reached
- Connected with progress bars

**Form Styling:**
- White cards with shadows
- Purple accent colors
- Consistent with ShareCase design
- Clear section headers
- Helpful placeholders

### Attachment Management
**Current Attachments:**
- Shows all existing attachments
- Image previews with full display
- "Remove" button for each
- Failed images show fallback

**Upload New:**
- Dashed border upload area
- Purple accent
- Click to upload
- Preview before adding
- Multiple uploads supported

## Error Handling

### Permission Errors
```javascript
if (!isOwner && !isAdmin) {
    alert('❌ You do not have permission to edit this case.');
    navigate(`/cases/${id}`);
}
```

### Validation Errors
```javascript
if (!formData.title || !formData.history) {
    alert('❌ Title and History are required!');
    return;
}
```

### Network Errors
```javascript
catch (error) {
    alert(`❌ Failed to update case: ${error.message}`);
}
```

### Load Errors
```javascript
if (error) {
    return <ErrorDisplay message={error} />;
}
```

## Testing Checklist

### As Case Author
- [ ] See Edit button on own case
- [ ] Click Edit and form loads with data
- [ ] Update title and save
- [ ] Update history and save
- [ ] Add new attachment
- [ ] Remove existing attachment
- [ ] Re-upload failed image
- [ ] Update tags
- [ ] Save and verify changes persist
- [ ] Check case detail shows updates

### As Admin
- [ ] See Edit button on any case
- [ ] Edit case from admin panel
- [ ] Edit case from detail page
- [ ] Update any field
- [ ] Fix broken images
- [ ] Save and verify changes

### As Other User
- [ ] Do NOT see Edit button
- [ ] Cannot access /cases/{id}/edit URL
- [ ] Get permission error if forced

### Error Scenarios
- [ ] Try editing without title → Error message
- [ ] Try editing without history → Error message
- [ ] Upload invalid file → Error message
- [ ] Network error → Graceful handling
- [ ] Session expired → Redirect to login

## Common Workflows

### Fix Broken Images
```
1. Navigate to case with broken images
2. Click "Edit" button
3. Go to Step 3 (Attachments & Tags)
4. See broken attachments listed
5. Click "Remove" on each broken one
6. Click upload area
7. Select new image file
8. See preview
9. Click "Add File"
10. Wait for upload success
11. Click "Update Case"
12. Return to case detail
13. Verify images now display
```

### Update Findings
```
1. Go to case
2. Click "Edit"
3. Go to Step 2 (Clinical Details)
4. Update findings fields
5. Click "Update Case"
6. Case shows new findings
```

### Add Tags
```
1. Edit case
2. Go to Step 3
3. Add tags: "#Pattern, #Syndrome"
4. Update case
5. Tags appear in case detail
```

## Limitations

### What Cannot Be Edited
- ❌ **Case author** - Cannot reassign to different user
- ❌ **Creation date** - Historical record preserved
- ❌ **Comments/discussions** - Use comment delete feature instead
- ❌ **Status** - Use moderation approve/reject instead
- ❌ **Views/likes** - Engagement metrics fixed

### What Can Be Edited
- ✅ Title
- ✅ Patient information
- ✅ Clinical history
- ✅ Medications
- ✅ All findings
- ✅ Classification
- ✅ Tags
- ✅ Attachments (add/remove)

## Future Enhancements

### Edit History
- Track all edits made
- Show "Last edited" timestamp
- View edit history
- Restore previous versions

### Draft Mode
- Save as draft during editing
- Auto-save feature
- Prevent lost changes
- Resume editing later

### Collaborative Editing
- Lock case during editing
- Show who's editing
- Prevent concurrent edits
- Edit notifications

### Bulk Edit
- Select multiple cases
- Update tags in bulk
- Change classifications
- Admin efficiency

### Suggested Edits
- Users suggest edits to others' cases
- Author reviews and accepts/rejects
- Track contribution credits
- Community improvement

## Security Considerations

### Authorization
- Backend verifies user identity
- Checks ownership or admin role
- Prevents unauthorized edits
- Logs all edit attempts

### Data Validation
- Required fields enforced
- Age sanitization
- Tag format validation
- File type restrictions

### Audit Trail
- Server logs all updates
- Tracks who edited what
- Timestamp of changes
- Useful for moderation

## Support & Troubleshooting

### "You do not have permission"
**Cause:** Not the case author and not admin

**Solution:**
- Verify you're logged in as correct user
- Check if you created this case
- Contact admin if you need edits

### Edit button not visible
**Cause:** Not logged in or not the author

**Solution:**
- Log in to your account
- Check you're on your own case
- Admins: Verify admin role in database

### Changes not saving
**Cause:** Network error or validation failure

**Solution:**
- Check browser console for errors
- Verify all required fields filled
- Check internet connection
- Try again

### Images still broken after re-upload
**Cause:** Old URL caching or server issue

**Solution:**
- Hard refresh browser (Ctrl+Shift+R)
- Check upload was successful
- Verify new URL is absolute (https://)
- Check server logs for upload errors

## Related Documentation
- `CASE_SUBMISSION_IMPROVEMENTS.md` - Case creation
- `ADMIN_SETUP_GUIDE.md` - Admin configuration
- `DELETE_FEATURES_GUIDE.md` - Content deletion
- `CHAT_IMAGE_RENDERING_FIX.md` - Image rendering

## API Reference

### Update Case
```
PUT /api/cases/:id
Authorization: Bearer {token}

Body:
{
    title: string,
    history: string,
    patientInfo: {...},
    medications: [string],
    findings: {...},
    tags: [string],
    attachments: [{...}]
}

Response (200):
{
    _id: string,
    title: string,
    author: {...},
    ... all case fields
}

Errors:
403: Unauthorized (not owner or admin)
404: Case not found
500: Server error
```

### Delete Comment
```
DELETE /api/cases/:id/comment/:commentId
Authorization: Bearer {token}

Response (200):
[...] // Updated comments array

Errors:
403: Not your comment
404: Case or comment not found
500: Server error
```

### Delete Message
```
DELETE /api/chat/messages/:messageId
Authorization: Bearer {token}

Response (200):
{
    message: "Message deleted successfully",
    id: string
}

Errors:
403: Not your message
404: Message not found
500: Server error
```

## Best Practices

### For Case Authors
- Review before publishing (reduces need to edit)
- Test image uploads work before submitting
- Use edit to fix minor issues
- Major changes? Consider new case

### For Admins
- Communicate with author before major edits
- Document reason for edits in notes
- Preserve author's intent
- Use edit to fix data quality issues

### For All Users
- Proofread before saving edits
- Don't abuse edit feature (track record)
- Be transparent about significant changes
- Respect community guidelines

## Version History Note

Currently NO edit history is tracked. Consider adding:
- "Last edited" timestamp
- Edit count
- "Edited by admin" flag
- Full edit history log

This would help maintain transparency and trust in the community.
