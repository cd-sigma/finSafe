import create from "zustand";
import { devtools, persist } from "zustand/middleware";
let userStore = (set) => ({
    userAddress:"",
    suppliedDetails:[],
    borrowedDetails:[],
    setBorrowedDetails: (value) => set((state) => ({...state, borrowedDetails: value})),
    setSuppliedDetails: (value) => set((state) => ({...state, suppliedDetails: value})),
    setUserAddress: (value) => set((state) => ({...state, userAddress: value})),
    feedData:[],
    setFeedData:(value)=>set((state)=>({...state,feedData:value})),
});

userStore = devtools(userStore);
userStore = persist(userStore, { name: "user" });

export const useUserStore = create(userStore);