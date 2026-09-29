import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const THEME_KEY = 'aegis-theme'

/** Hook مصغّر لتبديل Light/Dark — بيضيف/يشيل كلاس light على <html> ويحفظ التفضيل. */
function useThemeMode() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark' } catch (e) { return 'dark' }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    try { localStorage.setItem(THEME_KEY, theme) } catch (e) { /* ignore */ }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggleTheme]
}

/**
 * TopBar
 * الشريط العلوي: التبديل بين Light/Dark + هوية المستخدم (ثابتة، غير تفاعلية).
 *
 * ملاحظة Phase 1: أزرار القائمة/البحث/الإشعارات/المساعدة اتشالت لأنها كانت
 * شكلية (بدون أي وظيفة) — هترجع لما يبقى لها تنفيذ حقيقي.
 */
export default function TopBar() {
  const [theme, toggleTheme] = useThemeMode()
  return (
    <header className="h-16 flex items-center justify-end gap-4 px-6 border-b border-base-border shrink-0">
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 pl-2 select-none">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-semibold">
            A
          </div>
          <span className="text-slate-200 text-[13px] font-medium hidden lg:block">Admin User</span>
        </div>
      </div>
    </header>
  )
}