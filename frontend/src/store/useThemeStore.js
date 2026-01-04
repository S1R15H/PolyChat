import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chatapp-theme") || "coffee",
  setTheme: (theme) => {
    set({theme}),
    localStorage.setItem("chatapp-theme", theme)
},
}))
