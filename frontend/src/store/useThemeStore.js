import { create } from 'zustand'

export const useThemeStore = create((set) => ({
theme:localStorage.getItem("hoptalk-theme")||"cupcake",
setTheme: (theme) => {
    localStorage.setItem("hoptalk-theme", theme);
    set({ theme })},

}))