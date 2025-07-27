# Hiking Journal Authentication Setup

## Current Status
✅ API endpoint exists and is working  
🔐 Authentication required (401 status)  
❌ Need to configure proper authentication tokens

## Authentication Methods

The Hiking Journal API uses Clerk authentication. Here are the options to set up authentication:

### Option 1: API Token Authentication (Recommended)

1. **Get API Token from Hiking Journal App**
   - Log into the Hiking Journal app at https://hiking-journal-hwbthqfeg-onelio-vieras-projects.vercel.app/
   - Go to settings or developer section
   - Generate an API token for external access
   - Copy the token

2. **Configure Environment Variables**
   Add this line to your `.env.local` file in the health-tracker directory:

   ```bash
   # Hiking Journal Integration
   HEALTH_SYNC_TOKEN=your_actual_api_token_here
   ```

3. **Test the Integration**
   - Restart the development server: `npm run dev`
   - Go to the Exercise page
   - Try the "Sync from Hiking Journal" button

### Option 2: Cross-App Clerk Authentication (Alternative)

Since both apps use Clerk, you can set up cross-app authentication:

1. **Configure Clerk Environment Variables**
   Your `.env.local` already has Clerk configured:
   ```bash
   # Clerk Authentication (already configured)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvbW90ZWQtZGFuZS03NC5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=sk_test_WfPOMB50pRMX7NAHA17co5pCUC4mlWHTQ6z1RjBN8y
   ```

2. **Test Cross-App Authentication**
   - The updated sync endpoint now tries Clerk session tokens automatically
   - If you're logged into both apps with the same Clerk account, it should work
   - Check the Exercise page integration status

### Option 3: Public API (if available)

Check if the Hiking Journal app has a public API endpoint that doesn't require authentication.

## Testing the Authentication

### Step 1: Test with the provided script
```bash
# Run the test script
node test-hiking-journal-auth.js
```

### Step 2: Test in the App
1. Start the health-tracker app: `npm run dev`
2. Navigate to Exercise page
3. Check the integration status
4. Try syncing data

## Current Error Analysis

Based on the test results, the API is returning:
- **Status**: 401 Unauthorized
- **Error**: "Invalid JWT form. A JWT consists of three parts separated by dots."
- **Reason**: The API expects a valid JWT token but receives an invalid one

## Troubleshooting

### Issue: 401 Unauthorized
- Verify the API token is correct
- Check if the token has the required permissions
- Ensure the token hasn't expired

### Issue: 403 Forbidden
- The token might not have the right permissions
- Check if the API endpoint requires specific scopes

### Issue: Network Errors
- Check internet connectivity
- Verify the Hiking Journal app is accessible
- Check firewall/proxy settings

## Expected API Response

When authentication is successful, the API should return:

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

## Next Steps

1. **Get API Token**: Contact the Hiking Journal app developer or check the app's documentation
2. **Configure Environment**: Set up the `.env.local` file with the token
3. **Test Integration**: Try syncing data from the Hiking Journal
4. **Monitor Status**: Use the integration status card to verify everything works

## Demo Mode

If you can't get the API token immediately, you can still test the exercise tracking functionality using the "Create Demo Data" button, which creates sample hiking activities for demonstration purposes.

## Updated Integration Features

The sync endpoint now supports:
- ✅ Multiple authentication methods (API token, Clerk session token)
- ✅ Better error messages with specific recommendations
- ✅ Automatic fallback to demo data for testing
- ✅ Improved status checking with authentication method detection 