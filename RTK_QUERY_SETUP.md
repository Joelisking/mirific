# RTK Query Setup Complete ✅

Redux Toolkit Query has been successfully set up in the Mirific React Native app with auto-generated hooks from the backend API!

## What Was Installed

```bash
npm install @reduxjs/toolkit react-redux @rtk-query/codegen-openapi redux-persist @react-native-async-storage/async-storage esbuild-runner
```

## Project Structure

```
lib/redux/
├── api/
│   ├── index.ts              # Base API configuration with auth
│   ├── openapi-config.ts     # OpenAPI codegen configuration
│   └── generated.ts          # Auto-generated API hooks ⚡
├── slices/
│   └── authSlice.ts          # Authentication state management
├── hooks.ts                  # Typed Redux hooks
├── store.ts                  # Redux store with persistence
├── Provider.tsx              # Redux Provider component
├── README.md                 # Full documentation
└── EXAMPLE_USAGE.tsx         # Usage examples
```

## Quick Start

### 1. Wrap Your App

Add the Redux Provider to your root layout:

```tsx
// app/_layout.tsx
import { ReduxProvider } from '../lib/redux/Provider';

export default function RootLayout() {
  return (
    <ReduxProvider>
      <Stack>
        {/* Your app screens */}
      </Stack>
    </ReduxProvider>
  );
}
```

### 2. Use Auto-Generated Hooks

All API hooks are automatically generated from your Swagger documentation:

```tsx
import {
  usePostApiAuthLoginMutation,
  useGetApiHabitsQuery,
  usePostApiHabitsMutation,
  usePatchApiHabitsByIdToggleMutation,
} from '../lib/redux/api/generated';

// Login
const [login, { isLoading }] = usePostApiAuthLoginMutation();

// Get habits (auto-caches and refreshes)
const { data: habits, isLoading } = useGetApiHabitsQuery();

// Create habit
const [createHabit] = usePostApiHabitsMutation();

// Toggle habit completion
const [toggleHabit] = usePatchApiHabitsByIdToggleMutation();
```

### 3. Access Auth State

```tsx
import { useAppSelector, useAppDispatch } from '../lib/redux/hooks';
import { authActions } from '../lib/redux/slices/authSlice';

// Get user data
const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

// Dispatch actions
const dispatch = useAppDispatch();
dispatch(authActions.loginSuccess({ user, token }));
dispatch(authActions.logout());
```

## Available Hooks

### Authentication
- `usePostApiAuthRegisterMutation` - Register new user
- `usePostApiAuthLoginMutation` - Login user

### User Profile
- `useGetApiUsersProfileQuery` - Get user profile
- `useLazyGetApiUsersProfileQuery` - Lazy version
- `usePatchApiUsersProfileMutation` - Update profile

### Habits
- `useGetApiHabitsQuery` - Get all habits
- `useLazyGetApiHabitsQuery` - Lazy version
- `usePostApiHabitsMutation` - Create habit
- `usePatchApiHabitsByIdToggleMutation` - Toggle habit completion
- `useDeleteApiHabitsByIdMutation` - Delete habit

### Goals
- `useGetApiGoalsQuery` - Get all goals
- `useLazyGetApiGoalsQuery` - Lazy version
- `usePostApiGoalsMutation` - Create goal
- `usePatchApiGoalsByIdMutation` - Update goal
- `useDeleteApiGoalsByIdMutation` - Delete goal

## Regenerating Hooks

When the backend API changes, regenerate the hooks:

```bash
npm run codegen
```

**Requirements:**
- Backend server must be running at `http://localhost:3001`
- Swagger endpoint accessible at `http://localhost:3001/api-docs.json`

## Key Features

### ✅ Automatic Caching
Queries are automatically cached and shared across components

### ✅ Auto-Refetching
Mutations automatically invalidate and refetch related queries

### ✅ TypeScript Types
All types are auto-generated from OpenAPI spec

### ✅ Loading & Error States
Every hook provides `isLoading`, `error`, `isError` states

### ✅ State Persistence
Auth state is persisted to AsyncStorage

### ✅ Optimistic Updates
UI updates immediately, with automatic rollback on error

## Example Components

Check `lib/redux/EXAMPLE_USAGE.tsx` for complete examples:
- Login screen
- Habits list with toggle and delete
- Create habit form
- User profile display

## Configuration

### Change Backend URL

Edit `lib/redux/api/index.ts`:

```tsx
const BASE_URL = 'https://your-production-api.com';
```

### Customize Persistence

Edit `lib/redux/store.ts` to change what gets persisted:

```tsx
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Add more slices to persist
};
```

## Integration Checklist

- [x] Install dependencies
- [x] Create Redux store with RTK Query
- [x] Set up auth slice
- [x] Configure OpenAPI codegen
- [x] Generate API hooks from Swagger
- [x] Add Redux Provider
- [x] Create typed hooks
- [x] Add persistence with AsyncStorage
- [ ] Wrap app with ReduxProvider
- [ ] Replace mock data with API hooks
- [ ] Implement login/logout flow
- [ ] Test all API endpoints

## Next Steps

1. **Wrap your app** - Add `<ReduxProvider>` to `app/_layout.tsx`

2. **Replace mock data** - Update components to use generated hooks:
   - Replace `AppContext` with `useGetApiHabitsQuery()`, `useGetApiGoalsQuery()`
   - Update login screen to use `usePostApiAuthLoginMutation()`
   - Update onboarding to use `usePostApiAuthRegisterMutation()`

3. **Test the integration**:
   ```bash
   # Terminal 1: Start backend
   cd mirific-backend
   npm run dev

   # Terminal 2: Start Expo
   cd mirific
   npm start
   ```

4. **Handle authentication**:
   - Store token in Redux after login
   - Clear token on logout
   - Redirect to login if 401

## Documentation

- Full documentation: `lib/redux/README.md`
- Usage examples: `lib/redux/EXAMPLE_USAGE.tsx`
- Backend API docs: `http://localhost:3001/api-docs`

## Troubleshooting

### Codegen fails
- Ensure backend is running
- Check `http://localhost:3001/api-docs.json` is accessible
- Run `npm install --save-dev esbuild-runner`

### Auth not working
- Check if token is in Redux state
- Verify headers in network tab
- Check backend JWT secret matches

### Data not updating
- Check if mutation invalidates correct tags
- Use `refetch()` manually if needed
- Check Redux DevTools

## Resources

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [OpenAPI Codegen](https://github.com/reduxjs/redux-toolkit/tree/master/packages/rtk-query-codegen-openapi)
- Backend Swagger UI: http://localhost:3001/api-docs
