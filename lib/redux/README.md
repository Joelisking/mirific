# Redux Toolkit Query Setup

This folder contains the Redux Toolkit Query (RTK Query) setup for the Mirific app, with auto-generated hooks from the backend API.

## Structure

```
lib/redux/
├── api/
│   ├── index.ts              # Base API configuration
│   ├── openapi-config.ts     # OpenAPI codegen configuration
│   └── generated.ts          # Auto-generated API hooks (DON'T EDIT)
├── slices/
│   └── authSlice.ts          # Authentication state slice
├── hooks.ts                  # Typed Redux hooks
├── store.ts                  # Redux store configuration
└── Provider.tsx              # Redux Provider component
```

## Setup

### 1. Wrap your app with ReduxProvider

In your root layout file (`app/_layout.tsx`):

```tsx
import { ReduxProvider } from '../lib/redux/Provider';

export default function RootLayout() {
  return (
    <ReduxProvider>
      {/* Your app components */}
    </ReduxProvider>
  );
}
```

### 2. Generating API Hooks

Whenever the backend API changes, regenerate the hooks:

```bash
npm run codegen
```

This will:
1. Fetch the OpenAPI spec from `http://localhost:3001/api-docs.json`
2. Generate TypeScript types and RTK Query hooks in `lib/redux/api/generated.ts`

**Important:** Make sure the backend server is running before generating hooks!

## Available Hooks

All hooks are auto-generated from the Swagger documentation. Here are the available hooks:

### Authentication

```tsx
import {
  usePostApiAuthRegisterMutation,
  usePostApiAuthLoginMutation,
} from '../lib/redux/api/generated';

// Register
const [register, { isLoading, error }] = usePostApiAuthRegisterMutation();

await register({
  registerRequest: {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    goals: ['Exercise daily'],
    struggles: ['Procrastination'],
  },
});

// Login
const [login] = usePostApiAuthLoginMutation();

await login({
  loginRequest: {
    email: 'user@example.com',
    password: 'password123',
  },
});
```

### User Profile

```tsx
import {
  useGetApiUsersProfileQuery,
  usePatchApiUsersProfileMutation,
} from '../lib/redux/api/generated';

// Get profile (automatically fetches and caches)
const { data: user, isLoading, error } = useGetApiUsersProfileQuery();

// Update profile
const [updateProfile] = usePatchApiUsersProfileMutation();

await updateProfile({
  updateProfileRequest: {
    name: 'Jane Doe',
    goals: ['Exercise daily', 'Read more'],
  },
});
```

### Habits

```tsx
import {
  useGetApiHabitsQuery,
  usePostApiHabitsMutation,
  usePatchApiHabitsByIdToggleMutation,
  useDeleteApiHabitsByIdMutation,
} from '../lib/redux/api/generated';

// Get all habits (auto-fetches and caches)
const { data: habits, isLoading } = useGetApiHabitsQuery();

// Create habit
const [createHabit] = usePostApiHabitsMutation();

await createHabit({
  createHabitRequest: {
    name: 'Morning Meditation',
    emoji: '🧘',
    frequency: 'daily',
    reminderTime: '08:00',
  },
});

// Toggle habit completion
const [toggleHabit] = usePatchApiHabitsByIdToggleMutation();

await toggleHabit({ id: habitId });

// Delete habit
const [deleteHabit] = useDeleteApiHabitsByIdMutation();

await deleteHabit({ id: habitId });
```

### Goals

```tsx
import {
  useGetApiGoalsQuery,
  usePostApiGoalsMutation,
  usePatchApiGoalsByIdMutation,
  useDeleteApiGoalsByIdMutation,
} from '../lib/redux/api/generated';

// Get all goals
const { data: goals, isLoading } = useGetApiGoalsQuery();

// Create goal
const [createGoal] = usePostApiGoalsMutation();

await createGoal({
  createGoalRequest: {
    text: 'Complete React Native course',
    deadline: '2024-12-31',
    status: 'on-track',
    progress: 0,
  },
});

// Update goal
const [updateGoal] = usePatchApiGoalsByIdMutation();

await updateGoal({
  id: goalId,
  updateGoalRequest: {
    progress: 50,
    status: 'on-track',
  },
});

// Delete goal
const [deleteGoal] = useDeleteApiGoalsByIdMutation();

await deleteGoal({ id: goalId });
```

## Using Redux State

### Typed Hooks

Always use the typed hooks instead of the plain Redux hooks:

```tsx
import { useAppDispatch, useAppSelector } from '../lib/redux/hooks';

// Get auth state
const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

// Dispatch actions
const dispatch = useAppDispatch();
```

### Auth Actions

```tsx
import { authActions } from '../lib/redux/slices/authSlice';
import { useAppDispatch } from '../lib/redux/hooks';

const dispatch = useAppDispatch();

// After successful login
dispatch(authActions.loginSuccess({
  user: userData,
  token: jwtToken,
}));

// Logout
dispatch(authActions.logout());

// Update user
dispatch(authActions.updateUser({ points: 120 }));
```

## Features

### Automatic Caching

RTK Query automatically caches data. When you call `useGetApiHabitsQuery()`, it will:
1. Return cached data immediately if available
2. Fetch fresh data in the background
3. Update the UI when new data arrives

### Automatic Refetching

When you mutate data (create/update/delete), RTK Query automatically refetches related queries:

```tsx
const [createHabit] = usePostApiHabitsMutation();
const { data: habits } = useGetApiHabitsQuery(); // Will auto-update

// When you create a habit, the habits list automatically refreshes
await createHabit({ ... });
```

### Loading and Error States

All hooks return loading and error states:

```tsx
const { data, isLoading, error, isError } = useGetApiHabitsQuery();

if (isLoading) return <LoadingSpinner />;
if (isError) return <Error message={error.message} />;
return <HabitsList habits={data} />;
```

### Persistence

Auth state is persisted to AsyncStorage and will survive app restarts:

```tsx
// User data and token are automatically saved and restored
const { user, token } = useAppSelector((state) => state.auth);
```

## Configuration

### Change Backend URL

Update `BASE_URL` in `lib/redux/api/index.ts`:

```tsx
const BASE_URL = 'https://your-production-api.com';
```

### Add More State Slices

1. Create a new slice in `lib/redux/slices/`
2. Add it to the store in `lib/redux/store.ts`

## TypeScript Types

All types are auto-generated from the OpenAPI spec:

```tsx
import type {
  User,
  Habit,
  Goal,
  CreateHabitRequest,
  AuthResponse,
} from '../lib/redux/api/generated';
```

## Best Practices

1. **Don't edit `generated.ts`** - It will be overwritten when you run `npm run codegen`
2. **Use typed hooks** - Always use `useAppDispatch` and `useAppSelector`
3. **Handle errors** - Always handle `isError` and `error` from hooks
4. **Invalidate tags** - The codegen automatically handles cache invalidation
5. **Keep backend running** - Backend must be running at `http://localhost:3001` for codegen to work

## Troubleshooting

### Codegen fails

Make sure:
1. Backend server is running (`npm run dev` in mirific-backend)
2. Swagger endpoint is accessible at `http://localhost:3001/api-docs.json`
3. esbuild-runner is installed (`npm install --save-dev esbuild-runner`)

### Authentication errors

Check that:
1. User is logged in (check `isAuthenticated` state)
2. Token is being sent in headers (check Redux DevTools)
3. Backend is returning valid JWT tokens

### Data not updating

Try:
1. Check if the mutation invalidates the correct tags
2. Use `refetch()` from the query hook manually if needed
3. Check Redux DevTools to see the cached data
