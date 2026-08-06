import { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#060a14')
    } else {
      root.classList.remove('dark')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f4f7fb')
    }
    localStorage.setItem('darkMode', dark)
  }, [dark])

  const toggleDark = () => setDark((prev) => !prev)

  return (
    <DarkModeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext)
  if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider')
  return ctx
}
