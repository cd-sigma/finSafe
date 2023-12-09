import create from "zustand";
import { devtools, persist } from "zustand/middleware";
let userStore = (set) => ({
    userAddress:"",
    setUserAddress: (value) => set((state) => ({...state, userAddress: value})),
    feedData:[],
    setFeedData:(value)=>set((state)=>({...state,feedData:value})),
});

userStore = devtools(userStore);
userStore = persist(userStore, { name: "user" });

export const useUserStore = create(userStore);