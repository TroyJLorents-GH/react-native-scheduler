# Google Places API Setup for Address Autocomplete

## Overview
The app now includes full map functionality with address autocomplete using Google Places API. This allows users to:
- Search for addresses and places with autocomplete
- Select locations on the map
- Get directions to selected locations
- Use current location

## Setup Instructions

### 1. Get Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click on it and press "Enable"

### 2. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 3. Configure API Key
1. Open `config/api.ts`
2. Replace `'YOUR_GOOGLE_PLACES_API_KEY'` with your actual API key:
   ```typescript
   GOOGLE_PLACES_API_KEY: 'your_actual_api_key_here',
   ```

### 4. Restrict API Key (Recommended)
1. In Google Cloud Console, click on your API key
2. Under "Application restrictions", select "iOS apps"
3. Add your app's bundle identifier: `com.tlorents.scheduler`
4. Under "API restrictions", select "Restrict key"
5. Select "Places API" from the list

## Features Available

### Address Search
- Type in the search bar to get autocomplete suggestions
- Select from the dropdown to set the location
- Map automatically centers on selected location

### Map Interaction
- Tap anywhere on the map to select a location
- Use current location button for quick access
- View coordinates and address of selected location

### Directions
- Click the navigation icon to open Apple Maps with directions
- Automatically opens with route to selected location

## Troubleshooting

### API Key Issues
- Ensure the Places API is enabled in your Google Cloud project
- Check that your API key has the correct restrictions
- Verify the API key is correctly added to `config/api.ts`

### Map Not Loading
- Ensure you have location permissions enabled
- Check that `expo-maps` and `react-native-maps` are properly installed
- Verify the app has internet connectivity

### Address Search Not Working
- Check that Google Places API is enabled
- Verify API key restrictions allow iOS apps
- Ensure the API key has billing enabled (Google Places API requires billing)

## Cost Considerations
- Google Places API has usage-based pricing
- First $200 of usage per month is free
- Typical usage for this app should be minimal
- Monitor usage in Google Cloud Console

## Security Notes
- Never commit API keys to version control
- Use environment variables for production
- Restrict API keys to your app's bundle identifier
- Enable billing alerts to avoid unexpected charges
