# Hiking Journal Integration Setup

## Current Status

✅ **API Endpoint Available**: The Hiking Journal app now has the `/api/activities` endpoint implemented  
🔐 **Authentication Required**: The API requires proper authentication tokens  
❌ **Not Configured**: The health-tracker app needs proper authentication setup

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in the health-tracker directory with the following variables:

```bash
# Hiking Journal Integration
HEALTH_SYNC_TOKEN=your_hiking_journal_api_token_here

# Clerk Authentication (if needed for cross-app auth)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 2. Authentication Methods

The Hiking Journal API uses Clerk authentication. You have several options:

#### Option A: API Token Authentication
- Get an API token from the Hiking Journal app
- Set it as `HEALTH_SYNC_TOKEN` in your environment variables

#### Option B: Cross-App Authentication
- Configure Clerk to allow cross-app authentication
- Set up proper user session sharing between apps

#### Option C: Public API (if available)
- Check if the Hiking Journal app has a public API endpoint
- Use that for basic data syncing

### 3. Testing the Integration

1. Start the health-tracker app: `npm run dev`
2. Navigate to the Exercise page
3. Check the integration status card
4. Try the "Sync from Hiking Journal" button
5. If authentication fails, use "Create Demo Data" for testing

### 4. Expected API Response Format

The Hiking Journal API should return data in this format:

```json
{
  "data": [
    {
      "_id": "activity_id",
      "title": "Hiking Activity",
      "description": "Activity description",
      "date": "2025-07-27T10:00:00Z",
      "duration": 180,
      "distance": 5.2,
      "distanceUnit": "miles",
      "calories": 850,
      "elevation": {
        "gain": 1200,
        "loss": 1200
      },
      "location": {
        "name": "Trail Name"
      },
      "weather": {
        "temperature": 65,
        "conditions": "Sunny"
      },
      "difficulty": "moderate",
      "mood": "great",
      "notes": "Additional notes",
      "photos": [],
      "tags": []
    }
  ]
}
```

### 5. Troubleshooting

#### Issue: 401 Unauthorized
- Check that `HEALTH_SYNC_TOKEN` is set correctly
- Verify the token is valid in the Hiking Journal app
- Check if the token has the required permissions

#### Issue: 404 Not Found
- Verify the API endpoint URL is correct
- Check if the Hiking Journal app is deployed and running

#### Issue: Network Errors
- Check internet connectivity
- Verify the Hiking Journal app is accessible
- Check firewall/proxy settings

### 6. Demo Mode

If authentication cannot be configured, you can still test the exercise tracking functionality using the "Create Demo Data" button, which will create sample hiking activities for demonstration purposes.

## Current Integration Status

- ✅ API endpoint exists at `https://hiking-journal-amber.vercel.app/api/activities`
- 🔐 Authentication required (401 status)
- ⚠️ Need to configure proper authentication tokens
- ✅ Demo data available for testing

## Next Steps

1. Configure authentication tokens
2. Test the integration with real data
3. Set up automated syncing if needed
4. Monitor sync status and errors 