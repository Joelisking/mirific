# Clerk Authentication Setup

This guide explains how to set up Clerk authentication for the Mirific app, which provides OAuth (Google, Apple, etc.) and email/password authentication out of the box.

## Why Clerk?

Clerk provides:
- **OAuth Support**: Google, Apple, GitHub, and more - no credentials management needed
- **Email/Password**: Built-in authentication with magic links
- **User Management**: Profile management, session handling, and security
- **Expo Integration**: Native SDK with full React Native support
- **Development**: Free tier with unlimited dev environments

## Setup Steps

### 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application named "Mirific"

### 2. Enable Native API

**Important**: In the Clerk Dashboard, navigate to [**Native Applications**](https://dashboard.clerk.com/~/native-applications) and ensure that the Native API is enabled. This is required to integrate Clerk in your native application.

### 3. Configure OAuth Providers

In your Clerk Dashboard:

1. Go to **Configure** > **SSO Connections**
2. Enable the OAuth providers you want:

#### Google OAuth
- Click **+ Add connection** > **Google**
- Clerk handles the OAuth flow automatically - no client ID needed!
- Toggle **Enable for sign-up and sign-in**
- Save

#### Apple Sign In
- Click **+ Add connection** > **Apple**
- Clerk handles the configuration automatically
- Toggle **Enable for sign-up and sign-in**
- Save

#### Other Providers
- GitHub, Microsoft, Facebook, etc. - all work the same way
- Just enable them in the dashboard, no additional configuration required!

### 3. Get Your Publishable Key

1. In Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` for development)
3. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

4. Add your Clerk key:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### 4. Configure Development Settings

In Clerk Dashboard:

1. Go to **Configure** > **Settings**
2. **Session Settings**:
   - Set session lifetime as needed (default is fine)
3. **User & Authentication**:
   - Enable/disable email verification as needed
   - Configure username requirements

### 5. Test Authentication

1. Start your Expo dev server:
```bash
npm start
```

2. Open the app in Expo Go (or your development build)
3. You should see the sign-in screen with OAuth buttons
4. Try signing in with Google or Apple
5. Check the Clerk Dashboard > **Users** to see the new user

## How It Works

### Authentication Flow

1. **User clicks OAuth button** (Google/Apple)
2. **Clerk SDK opens browser** with OAuth provider
3. **User authorizes** in provider's interface
4. **Clerk creates session** and returns to app
5. **App receives user data** from Clerk

### Code Structure

- **ClerkProvider** ([_layout.tsx:36](app/_layout.tsx#L36)): Wraps the app
- **ClerkAccountStep** ([ClerkAccountStep.tsx](components/onboarding/ClerkAccountStep.tsx)): OAuth buttons
- **useAuth hook**: Check authentication state
- **useUser hook**: Access user data

### User Data

Clerk provides:
- `user.id` - Unique user ID
- `user.emailAddresses[0].emailAddress` - Primary email
- `user.firstName`, `user.lastName` - Name from OAuth
- `user.imageUrl` - Profile picture
- `user.publicMetadata` - Custom data you can store

### Backend Integration

The backend needs to verify Clerk sessions. Install the Clerk SDK:

```bash
cd mirific-backend
npm install @clerk/clerk-sdk-node
```

Then verify tokens in your API middleware:

```typescript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

app.use('/api/*', ClerkExpressRequireAuth());
```

## Environment Variables

### Frontend (.env)
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)
```env
CLERK_SECRET_KEY=sk_test_...
```

Get your secret key from Clerk Dashboard > **API Keys**.

## Testing

### Development
- Use Clerk's test mode (keys starting with `pk_test_` and `sk_test_`)
- Test users won't count against your quota
- Can easily reset test data

### Production
- Switch to production keys (`pk_live_` and `sk_live_`)
- Configure production OAuth apps if needed
- Set up custom domains and branding

## Troubleshooting

### "Invalid publishable key"
- Check that your `.env` file exists and has the correct key
- Restart the Expo dev server after changing environment variables
- Make sure the key starts with `EXPO_PUBLIC_`

### OAuth not working
- Check that the provider is enabled in Clerk Dashboard
- Make sure you're testing on a physical device for Apple Sign In
- Check browser console for OAuth errors

### Session issues
- Clear app data and try again
- Check Clerk Dashboard > **Sessions** for active sessions
- Verify token cache is working (uses expo-secure-store)

## Next Steps

- **Sync with Backend**: Update backend to verify Clerk tokens
- **User Metadata**: Store onboarding data in Clerk's user metadata
- **Profile Management**: Add settings screen with Clerk's UserProfile component
- **Sign Out**: Implement sign out functionality

## Resources

- [Clerk Docs](https://clerk.com/docs)
- [Clerk Expo SDK](https://clerk.com/docs/quickstarts/expo)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Clerk Community](https://clerk.com/discord)
