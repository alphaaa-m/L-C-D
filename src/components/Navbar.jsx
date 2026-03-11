import { motion } from 'framer-motion'
import { MoonStar, Sparkles, SunMedium } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'about', label: 'About' },
]

function Navbar({ onNavigate, onToggleTheme, theme, viewMode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-3 rounded-full px-2 py-1 text-left"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold">My College Journey</span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
              Moments from the last two years
            </span>
          </span>
        </button>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2 lg:flex-none">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (item.id === 'timeline' && viewMode === 'timeline') ||
              (item.id === 'gallery' && viewMode === 'gallery')

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'text-white dark:text-slate-950'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-slate-950 dark:bg-white"
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/70 text-slate-800 transition hover:-translate-y-0.5 hover:bg-white dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
        </button>
      </motion.div>
    </header>
  )
}

export default Navbar