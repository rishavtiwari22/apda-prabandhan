import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: !!user,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      updateUser: (user) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),
    }),
    {
      name: "auth-storage", // local storage key
    }
  )
);

export default useAuthStore;
