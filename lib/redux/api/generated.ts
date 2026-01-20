import { api } from "./index";
export const addTagTypes = [
  "Authentication",
  "Clerk",
  "Goals",
  "Habits",
  "OAuth",
  "User",
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      postApiAuthRegister: build.mutation<
        PostApiAuthRegisterApiResponse,
        PostApiAuthRegisterApiArg
      >({
        query: (queryArg) => ({
          url: `/api/auth/register`,
          method: "POST",
          body: queryArg.registerRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiAuthLogin: build.mutation<
        PostApiAuthLoginApiResponse,
        PostApiAuthLoginApiArg
      >({
        query: (queryArg) => ({
          url: `/api/auth/login`,
          method: "POST",
          body: queryArg.loginRequest,
        }),
        invalidatesTags: ["Authentication"],
      }),
      postApiClerkSync: build.mutation<
        PostApiClerkSyncApiResponse,
        PostApiClerkSyncApiArg
      >({
        query: (queryArg) => ({
          url: `/api/clerk/sync`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Clerk"],
      }),
      getApiClerkProfile: build.query<
        GetApiClerkProfileApiResponse,
        GetApiClerkProfileApiArg
      >({
        query: () => ({ url: `/api/clerk/profile` }),
        providesTags: ["Clerk"],
      }),
      getApiGoals: build.query<GetApiGoalsApiResponse, GetApiGoalsApiArg>({
        query: () => ({ url: `/api/goals` }),
        providesTags: ["Goals"],
      }),
      postApiGoals: build.mutation<PostApiGoalsApiResponse, PostApiGoalsApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/goals`,
            method: "POST",
            body: queryArg.createGoalRequest,
          }),
          invalidatesTags: ["Goals"],
        },
      ),
      patchApiGoalsById: build.mutation<
        PatchApiGoalsByIdApiResponse,
        PatchApiGoalsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/goals/${queryArg.id}`,
          method: "PATCH",
          body: queryArg.updateGoalRequest,
        }),
        invalidatesTags: ["Goals"],
      }),
      deleteApiGoalsById: build.mutation<
        DeleteApiGoalsByIdApiResponse,
        DeleteApiGoalsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/goals/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Goals"],
      }),
      getApiHabits: build.query<GetApiHabitsApiResponse, GetApiHabitsApiArg>({
        query: () => ({ url: `/api/habits` }),
        providesTags: ["Habits"],
      }),
      postApiHabits: build.mutation<
        PostApiHabitsApiResponse,
        PostApiHabitsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/habits`,
          method: "POST",
          body: queryArg.createHabitRequest,
        }),
        invalidatesTags: ["Habits"],
      }),
      patchApiHabitsById: build.mutation<
        PatchApiHabitsByIdApiResponse,
        PatchApiHabitsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/habits/${queryArg.id}`,
          method: "PATCH",
        }),
        invalidatesTags: ["Habits"],
      }),
      putApiHabitsById: build.mutation<
        PutApiHabitsByIdApiResponse,
        PutApiHabitsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/habits/${queryArg.id}`,
          method: "PUT",
          body: queryArg.updateHabitRequest,
        }),
        invalidatesTags: ["Habits"],
      }),
      deleteApiHabitsById: build.mutation<
        DeleteApiHabitsByIdApiResponse,
        DeleteApiHabitsByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/habits/${queryArg.id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Habits"],
      }),
      postApiOauthGoogle: build.mutation<
        PostApiOauthGoogleApiResponse,
        PostApiOauthGoogleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/oauth/google`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["OAuth"],
      }),
      postApiOauthApple: build.mutation<
        PostApiOauthAppleApiResponse,
        PostApiOauthAppleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/oauth/apple`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["OAuth"],
      }),
      getApiUsersProfile: build.query<
        GetApiUsersProfileApiResponse,
        GetApiUsersProfileApiArg
      >({
        query: () => ({ url: `/api/users/profile` }),
        providesTags: ["User"],
      }),
      patchApiUsersProfile: build.mutation<
        PatchApiUsersProfileApiResponse,
        PatchApiUsersProfileApiArg
      >({
        query: (queryArg) => ({
          url: `/api/users/profile`,
          method: "PATCH",
          body: queryArg.updateProfileRequest,
        }),
        invalidatesTags: ["User"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as api };
export type PostApiAuthRegisterApiResponse =
  /** status 201 User successfully registered */ AuthResponse;
export type PostApiAuthRegisterApiArg = {
  registerRequest: RegisterRequest;
};
export type PostApiAuthLoginApiResponse =
  /** status 200 Login successful */ AuthResponse;
export type PostApiAuthLoginApiArg = {
  loginRequest: LoginRequest;
};
export type PostApiClerkSyncApiResponse =
  /** status 200 User synced successfully */ {
    message?: string;
    user?: User;
  };
export type PostApiClerkSyncApiArg = {
  body: {
    email?: string;
    name?: string;
    goals?: string[];
    struggles?: string[];
    communicationMode?: "text" | "voice";
    reminderTone?: "gentle" | "firm" | "motivational";
  };
};
export type GetApiClerkProfileApiResponse =
  /** status 200 User profile retrieved successfully */ {
    user?: User;
  };
export type GetApiClerkProfileApiArg = void;
export type GetApiGoalsApiResponse =
  /** status 200 Goals retrieved successfully */ Goal[];
export type GetApiGoalsApiArg = void;
export type PostApiGoalsApiResponse =
  /** status 201 Goal created successfully */ Goal;
export type PostApiGoalsApiArg = {
  createGoalRequest: CreateGoalRequest;
};
export type PatchApiGoalsByIdApiResponse =
  /** status 200 Goal updated successfully */ Goal;
export type PatchApiGoalsByIdApiArg = {
  /** Goal ID */
  id: string;
  updateGoalRequest: UpdateGoalRequest;
};
export type DeleteApiGoalsByIdApiResponse =
  /** status 200 Goal deleted successfully */ {
    message?: string;
  };
export type DeleteApiGoalsByIdApiArg = {
  /** Goal ID */
  id: string;
};
export type GetApiHabitsApiResponse =
  /** status 200 Habits retrieved successfully */ Habit[];
export type GetApiHabitsApiArg = void;
export type PostApiHabitsApiResponse =
  /** status 201 Habit created successfully */ Habit;
export type PostApiHabitsApiArg = {
  createHabitRequest: CreateHabitRequest;
};
export type PatchApiHabitsByIdApiResponse =
  /** status 200 Habit toggled successfully */ Habit;
export type PatchApiHabitsByIdApiArg = {
  id: string;
};
export type PutApiHabitsByIdApiResponse =
  /** status 200 Habit updated successfully */ Habit;
export type PutApiHabitsByIdApiArg = {
  id: string;
  updateHabitRequest: UpdateHabitRequest;
};
export type DeleteApiHabitsByIdApiResponse =
  /** status 200 Habit deleted successfully */ {
    message?: string;
  };
export type DeleteApiHabitsByIdApiArg = {
  id: string;
};
export type PostApiOauthGoogleApiResponse =
  /** status 200 Google authentication successful */ AuthResponse;
export type PostApiOauthGoogleApiArg = {
  body: {
    /** Google ID token */
    idToken: string;
  };
};
export type PostApiOauthAppleApiResponse =
  /** status 200 Apple authentication successful */ AuthResponse;
export type PostApiOauthAppleApiArg = {
  body: {
    /** Apple identity token */
    identityToken: string;
    user?: {
      email?: string;
      fullName?: {
        givenName?: string;
        familyName?: string;
      };
    };
  };
};
export type GetApiUsersProfileApiResponse =
  /** status 200 Profile retrieved successfully */ User;
export type GetApiUsersProfileApiArg = void;
export type PatchApiUsersProfileApiResponse =
  /** status 200 Profile updated successfully */ User;
export type PatchApiUsersProfileApiArg = {
  updateProfileRequest: UpdateProfileRequest;
};
export type User = {
  id?: string;
  email?: string;
  name?: string;
  goals?: string[];
  struggles?: string[];
  communicationMode?: "text" | "voice";
  reminderTone?: "gentle" | "firm" | "motivational";
  points?: number;
  streak?: number;
  createdAt?: string;
};
export type AuthResponse = {
  token?: string;
  user?: User;
  message?: string;
  isNewUser?: boolean;
};
export type Error = {
  message?: string;
};
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  goals?: string[];
  struggles?: string[];
  communicationMode?: "text" | "voice";
  reminderTone?: "gentle" | "firm" | "motivational";
};
export type LoginRequest = {
  email: string;
  password: string;
};
export type Goal = {
  id?: string;
  userId?: string;
  text?: string;
  deadline?: string;
  status?: "on-track" | "at-risk" | "completed";
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateGoalRequest = {
  text: string;
  deadline: string;
  status?: "on-track" | "at-risk" | "completed";
  progress?: number;
};
export type UpdateGoalRequest = {
  text?: string;
  deadline?: string;
  status?: "on-track" | "at-risk" | "completed";
  progress?: number;
};
export type Habit = {
  id?: string;
  userId?: string;
  name?: string;
  emoji?: string;
  frequency?: "daily" | "weekly" | "monthly";
  completedToday?: boolean;
  streak?: number;
  reminderTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateHabitRequest = {
  name: string;
  emoji: string;
  frequency?: "daily" | "weekly" | "monthly";
  reminderTime?: string | null;
};
export type UpdateHabitRequest = {
  name?: string;
  emoji?: string;
  frequency?: "daily" | "weekly" | "monthly";
  reminderTime?: string | null;
};
export type UpdateProfileRequest = {
  name?: string;
  goals?: string[];
  struggles?: string[];
  communicationMode?: "text" | "voice";
  reminderTone?: "gentle" | "firm" | "motivational";
};
export const {
  usePostApiAuthRegisterMutation,
  usePostApiAuthLoginMutation,
  usePostApiClerkSyncMutation,
  useGetApiClerkProfileQuery,
  useLazyGetApiClerkProfileQuery,
  useGetApiGoalsQuery,
  useLazyGetApiGoalsQuery,
  usePostApiGoalsMutation,
  usePatchApiGoalsByIdMutation,
  useDeleteApiGoalsByIdMutation,
  useGetApiHabitsQuery,
  useLazyGetApiHabitsQuery,
  usePostApiHabitsMutation,
  usePatchApiHabitsByIdMutation,
  usePutApiHabitsByIdMutation,
  useDeleteApiHabitsByIdMutation,
  usePostApiOauthGoogleMutation,
  usePostApiOauthAppleMutation,
  useGetApiUsersProfileQuery,
  useLazyGetApiUsersProfileQuery,
  usePatchApiUsersProfileMutation,
} = injectedRtkApi;
