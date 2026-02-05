# Case of the Week - Community Feature

## Overview

The "Case of the Week" feature on the home page now showcases community-posted cases instead of only static cases from the database. This makes the platform more dynamic and highlights the contributions of your community members.

## How It Works

### Automatic Selection
- The system first checks if there's a manually featured case (set by admins)
- If no manual feature exists, it automatically rotates through published community cases using a weekly rotation
- The rotation is based on the current week number, ensuring the featured case changes consistently every week
- Falls back to static cases if no community cases are available

### Manual Featuring (Admin Only)
Admins can manually feature any published community case:
1. Go to **Admin Dashboard** (`/admin/moderation`)
2. Navigate to the **Case Moderation** tab
3. Select a **published** case
4. Click **"⭐ Feature as Case of the Week"** button
5. The case will immediately appear on the home page

To remove a featured case:
1. Select the currently featured case in the admin dashboard
2. Click **"📌 Remove from Featured"** button
3. The system will revert to automatic rotation

## Technical Implementation

### Backend Changes

**New Fields in `CommunityCase` Model:**
- `featured` (Boolean): Indicates if the case is manually featured
- `featuredAt` (Date): Timestamp of when the case was featured

**New API Endpoints:**
- `GET /api/cases/featured` - Fetches the current case of the week
- `PUT /api/cases/:id/feature` - Admin endpoint to feature/unfeature a case (requires admin authentication)

### Frontend Changes

**Home Page (`src/pages/Home.jsx`):**
- Now fetches the featured case from the API instead of using only static data
- Displays case author, community engagement metrics (views, likes)
- Shows case tags
- Dynamically links to the correct case detail page
- Updates the total cases count to include both static and community cases

**Admin Dashboard (`src/pages/AdminModeration.jsx`):**
- Added "Feature/Unfeature" button for published cases
- Visual indicator showing which case is currently featured
- Confirmation dialogs for feature/unfeature actions

### Display Differences

Community cases show:
- Author name (e.g., "by Dr. Smith")
- "From Our Community" label
- Patient demographics from `patientInfo` (age, age unit, gender)
- Clinical history excerpt
- Engagement metrics (views and likes)
- Case tags

Static cases show:
- "Updated Weekly" label
- Patient context from static data
- Chief complaint
- Difficulty level

## Benefits

1. **Community Engagement**: Highlights quality contributions from your users
2. **Fresh Content**: Ensures the home page features recent, real-world cases
3. **Recognition**: Gives community members visibility for their submissions
4. **Flexibility**: Admins can manually feature exceptional cases or let the system auto-rotate
5. **Scalability**: As your community grows, more diverse cases will be featured

## Admin Guidelines

When manually featuring a case:
- ✅ Choose cases with clear, educational value
- ✅ Ensure proper patient de-identification
- ✅ Prefer cases with quality attachments and detailed findings
- ✅ Rotate featured cases regularly to give multiple members recognition
- ❌ Don't feature the same case for extended periods
- ❌ Avoid featuring cases with privacy concerns

## Future Enhancements

Potential improvements to consider:
- Popularity-based featuring (most viewed, most liked)
- Category-specific rotation (feature different EEG pattern types)
- User voting for "Case of the Week"
- Email notifications when a user's case is featured
- Featured case history/archive page
