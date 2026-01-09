# OAuth Setup Guide

This guide will help you configure Google and Apple OAuth for the Mirific app.

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** or **Google Sign-In API**

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in the required information:
   - App name: Mirific
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 3. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Create credentials for each platform:

#### Web Application (for token verification)
- Application type: **Web application**
- Name: Mirific Web
- Copy the **Client ID** to backend `.env` as `GOOGLE_CLIENT_ID`

#### iOS
- Application type: **iOS**
- Name: Mirific iOS
- Bundle ID: `com.mirific.app` (from app.json)
- Copy the **Client ID** to [OAuthButtons.tsx](components/auth/OAuthButtons.tsx) as `iosClientId`

#### Android
- Application type: **Android**
- Name: Mirific Android
- Package name: `com.mirific.app` (from app.json)
- SHA-1 fingerprint: Get it by running:
  ```bash
  cd android && ./gradlew signingReport
  ```
- Copy the **Client ID** to [OAuthButtons.tsx](components/auth/OAuthButtons.tsx) as `androidClientId`

### 4. Update Frontend Configuration

Edit [components/auth/OAuthButtons.tsx](components/auth/OAuthButtons.tsx):

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Same as GOOGLE_CLIENT_ID in backend
});
```

## Apple Sign In Setup

### 1. Configure App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Go to **Certificates, Identifiers & Profiles** > **Identifiers**
3. Create or select your App ID: `com.mirific.app`
4. Enable **Sign in with Apple** capability
5. Save

### 2. Update Backend Configuration

Add to `mirific-backend/.env`:
```
APPLE_CLIENT_ID="com.mirific.app"
```

### 3. Configure Expo

The app.json is already configured with:
```json
{
  "ios": {
    "bundleIdentifier": "com.mirific.app"
  }
}
```

### 4. Test on Physical Device

**Important**: Apple Sign In only works on physical iOS devices, not on simulators.

## Testing OAuth

### Google OAuth
1. Update the client IDs in OAuthButtons.tsx
2. Update GOOGLE_CLIENT_ID in backend .env
3. Run the app: `npm start`
4. Tap "Google" button on account creation screen
5. Sign in with your Google account

### Apple Sign In
1. Build the app: `eas build --profile development --platform ios`
2. Install on a physical iOS device
3. Tap "Apple" button on account creation screen
4. Sign in with your Apple ID

## Environment Variables Checklist

### Backend (.env)
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console (Web client)
- [ ] `APPLE_CLIENT_ID` - Your bundle identifier (com.mirific.app)

### Frontend (OAuthButtons.tsx)
- [ ] `androidClientId` - From Google Cloud Console (Android client)
- [ ] `iosClientId` - From Google Cloud Console (iOS client)
- [ ] `webClientId` - Same as backend GOOGLE_CLIENT_ID

## Troubleshooting

### Google OAuth Issues
- **"Invalid client ID"**: Ensure the webClientId matches GOOGLE_CLIENT_ID in backend
- **"Invalid Android package name"**: Check that package name in Google Console matches app.json
- **"Developer Error"**: OAuth consent screen not configured properly

### Apple Sign In Issues
- **Button doesn't show**: You're on Android (Apple Sign In is iOS only)
- **"Not available"**: Testing on simulator (requires physical device)
- **"Invalid client"**: Bundle identifier doesn't match Apple Developer Portal
