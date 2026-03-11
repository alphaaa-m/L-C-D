import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import {
  CalendarRange,
  Images,
  Shuffle,
  Sparkles,
  SlidersHorizontal,
  Waypoints,
} from 'lucide-react'
import Gallery from './components/Gallery'
import MemoryModal from './components/MemoryModal'
import Navbar from './components/Navbar'
import Timeline from './components/Timeline'

const customModules = import.meta.glob('./data/memories.json', { eager: true })
const sampleModules = import.meta.glob('./data/sampleMemories.json', {
  eager: true,
})

const DEFAULT_FILTER = 'All'

function normalizeMemories(source) {
  if (Array.isArray(source)) {
    return source
  }

  if (source && typeof source === 'object' && Array.isArray(source.memories)) {
    return source.memories
  }

  return []
}

function getMemoryYear(memory) {
  if (typeof memory.year === 'number') {
    return memory.year
  }

  const matchedYear = String(memory.date ?? '').match(/\b(19|20)\d{2}\b/)

  if (matchedYear) {
    return Number(matchedYear[0])
  }

  if (memory.sortDate) {
    const preciseDate = new Date(memory.sortDate)

    if (!Number.isNaN(preciseDate.getTime())) {
      return preciseDate.getFullYear()
    }
  }

  return new Date().getFullYear()
}

function getMemoryTimestamp(memory) {
  if (memory.sortDate) {
    const preciseDate = new Date(memory.sortDate)

    if (!Number.isNaN(preciseDate.getTime())) {
      return preciseDate.getTime()
    }
  }

  const displayDate = new Date(`1 ${memory.date ?? ''}`)

  if (!Number.isNaN(displayDate.getTime())) {
    return displayDate.getTime()
  }

  return new Date(getMemoryYear(memory), 0, 1).getTime()
}

const rawCustomData = customModules['./data/memories.json']?.default
const rawSampleData = sampleModules['./data/sampleMemories.json']?.default ?? []

function App() {
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.24,
  })
  const [viewMode, setViewMode] = useState('timeline')
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [activeFilter, setActiveFilter] = useState(DEFAULT_FILTER)
  const [selectedYear, setSelectedYear] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const storedTheme = window.localStorage.getItem('college-journey-theme')

    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  const customMemories = useMemo(() => normalizeMemories(rawCustomData), [])
  const sampleMemories = useMemo(() => normalizeMemories(rawSampleData), [])
  const sourceMemories = customMemories.length > 0 ? customMemories : sampleMemories

  const memories = useMemo(
    () =>
      sourceMemories
        .map((memory, index) => ({
          ...memory,
          id: memory.id ?? index + 1,
          year: getMemoryYear(memory),
          filters: memory.occasionType ? [memory.occasionType] : [],
          fullDescription: memory.fullDescription || memory.description,
        }))
        .sort((left, right) => getMemoryTimestamp(left) - getMemoryTimestamp(right)),
    [sourceMemories],
  )

  const categoryFilters = useMemo(
    () => [
      DEFAULT_FILTER,
      ...new Set(
        memories
          .map((memory) => memory.occasionType)
          .filter((occasionType) => Boolean(occasionType)),
      ),
    ],
    [memories],
  )

  const effectiveActiveFilter = useMemo(
    () => (categoryFilters.includes(activeFilter) ? activeFilter : DEFAULT_FILTER),
    [activeFilter, categoryFilters],
  )

  const availableYears = useMemo(
    () =>
      [...new Set(memories.map((memory) => memory.year))].sort(
        (left, right) => left - right,
      ),
    [memories],
  )

  const effectiveSelectedYear = useMemo(
    () =>
      selectedYear !== null && availableYears.includes(selectedYear)
        ? selectedYear
        : null,
    [availableYears, selectedYear],
  )

  const yearScopedMemories = useMemo(
    () =>
      memories.filter(
        (memory) =>
          effectiveSelectedYear === null || memory.year === effectiveSelectedYear,
      ),
    [effectiveSelectedYear, memories],
  )

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        categoryFilters.map((filter) => [
          filter,
          filter === DEFAULT_FILTER
            ? yearScopedMemories.length
            : yearScopedMemories.filter((memory) => memory.filters.includes(filter))
                .length,
        ]),
      ),
    [categoryFilters, yearScopedMemories],
  )

  const filteredMemories = useMemo(
    () =>
      yearScopedMemories.filter(
        (memory) =>
          effectiveActiveFilter === DEFAULT_FILTER ||
          memory.filters.includes(effectiveActiveFilter),
      ),
    [effectiveActiveFilter, yearScopedMemories],
  )

  const deferredMemories = useDeferredValue(filteredMemories)
  const popularTags = useMemo(() => {
    const frequency = memories.reduce((collection, memory) => {
      const nextCollection = collection

      memory.tags.forEach((tag) => {
        nextCollection[tag] = (nextCollection[tag] ?? 0) + 1
      })

      return nextCollection
    }, {})

    return Object.entries(frequency)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([tag]) => tag)
  }, [memories])

  const activeYearIndex = useMemo(() => {
    if (!availableYears.length) {
      return 0
    }

    if (effectiveSelectedYear === null) {
      return availableYears.length - 1
    }

    const matchedIndex = availableYears.indexOf(effectiveSelectedYear)
    return matchedIndex === -1 ? availableYears.length - 1 : matchedIndex
  }, [availableYears, effectiveSelectedYear])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('college-journey-theme', theme)
  }, [theme])

  const featuredMemories = deferredMemories.slice(0, 3)

  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function handleNavigate(destination) {
    if (destination === 'timeline') {
      startTransition(() => {
        setViewMode('timeline')
      })
      scrollToSection('memories')
      return
    }

    if (destination === 'gallery') {
      startTransition(() => {
        setViewMode('gallery')
      })
      scrollToSection('memories')
      return
    }

    scrollToSection(destination)
  }

  function handleFilterChange(filter) {
    startTransition(() => {
      setActiveFilter(filter)
    })
  }

  function handleYearChange(event) {
    const yearIndex = Number(event.target.value)
    const nextYear = availableYears[yearIndex] ?? null

    startTransition(() => {
      setSelectedYear(nextYear)
    })
  }

  function resetFilters() {
    startTransition(() => {
      setActiveFilter(DEFAULT_FILTER)
      setSelectedYear(null)
      setViewMode('timeline')
    })
  }

  const journeyEnding = memories.length
    ? memories[memories.length - 1].title
    : 'Last Memories'

  function openRandomMemory() {
    if (!deferredMemories.length) {
      return
    }

    const randomIndex = Math.floor(Math.random() * deferredMemories.length)
    setSelectedMemory(deferredMemories[randomIndex])
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--fg)]">
      <motion.div
        className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-400"
        style={{ scaleX: scrollProgress }}
      />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/20"
          animate={{ x: [0, 36, 0], y: [0, -18, 0] }}
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-500/16"
          animate={{ x: [0, -30, 0], y: [0, 26, 0] }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10"
          animate={{ x: [0, 18, 0], y: [0, -22, 0] }}
          transition={{
            duration: 16,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      </div>

      <Navbar
        onNavigate={handleNavigate}
        onToggleTheme={() =>
          setTheme((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark',
          )
        }
        theme={theme}
        viewMode={viewMode}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <section
          id="home"
          className="hero-surface glass-panel-strong scroll-mt-28 relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14 lg:px-12"
        >
          <div className="soft-grid absolute inset-0 opacity-60" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/55 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <Sparkles className="h-4 w-4" />
                A timeline of our real college events and shared moments
              </motion.span>

              <motion.h1
                className="mt-6 text-balance font-display text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
              >
                My College Journey
              </motion.h1>

              <motion.p
                className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
              >
                This story is built from our own event folders: Trip Murree
                Bhurban 2024, Sports Culture Day 2025, Movie Date 2025, Coat
                Check 2025, and Last Day 11th Class 2025.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-4"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => handleNavigate('timeline')}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  Start Exploring
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('gallery')}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/70 px-6 py-3 text-sm font-semibold text-slate-800 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12"
                >
                  Open Gallery
                </button>
                <button
                  type="button"
                  onClick={openRandomMemory}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/12 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-500/18 dark:border-indigo-300/35 dark:bg-indigo-400/14 dark:text-indigo-100"
                >
                  <Shuffle className="h-4 w-4" />
                  Surprise Memory
                </button>
              </motion.div>

              <motion.div
                className="mt-10 grid gap-4 sm:grid-cols-3"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
              >
                <div className="glass-panel rounded-[1.5rem] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Memories
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    {memories.length}
                  </p>
                </div>
                <div className="glass-panel rounded-[1.5rem] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Years Covered
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    {availableYears.length}
                  </p>
                </div>
                <div className="glass-panel rounded-[1.5rem] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Journey Ends With
                  </p>
                  <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                    {journeyEnding}
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="glass-panel mt-6 overflow-hidden rounded-full py-2"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <motion.div
                  className="flex w-max items-center gap-3 px-3"
                  animate={{ x: [0, -540] }}
                  transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                >
                  {[...popularTags, ...popularTags].map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-white/8 dark:text-slate-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="glass-panel rounded-[2rem] p-5 sm:p-6"
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.18 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Journey Snapshot
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold">
                    Where the journey begins
                  </h2>
                </div>
                <div className="rounded-full bg-indigo-500/12 p-3 text-indigo-600 dark:bg-indigo-400/12 dark:text-indigo-200">
                  <CalendarRange className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {featuredMemories.map((memory, index) => (
                  <motion.button
                    key={memory.id}
                    type="button"
                    onClick={() => setSelectedMemory(memory)}
                    className="group flex w-full items-center gap-4 rounded-[1.4rem] border border-white/35 bg-white/70 p-3 text-left transition hover:-translate-y-1 hover:shadow-xl dark:border-white/8 dark:bg-white/6"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
                  >
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="h-20 w-20 rounded-[1rem] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-display text-lg font-semibold">
                          {memory.title}
                        </p>
                        <span className="text-xs font-medium text-[var(--muted)]">
                          {memory.date}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                        {memory.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="memories"
          className="scroll-mt-28 space-y-8 rounded-[2rem] border border-[var(--border)] bg-white/35 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-white/4 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200">
                <Waypoints className="h-4 w-4" />
                Memory Explorer
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                Follow every chapter in order
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--muted)] sm:text-lg">
                Explore each real event folder in sequence, starting with 2024
                and ending with our final 2025 moments.
              </p>
            </div>

            <div className="glass-panel flex flex-wrap items-center gap-3 rounded-[1.5rem] p-3">
              {['timeline', 'gallery'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setViewMode(mode)
                    })
                  }}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    viewMode === mode
                      ? 'text-white dark:text-slate-950'
                      : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {viewMode === mode ? (
                    <motion.span
                      layoutId="active-view"
                      className="absolute inset-0 rounded-full bg-slate-950 dark:bg-white"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {mode === 'timeline' ? (
                      <Waypoints className="h-4 w-4" />
                    ) : (
                      <Images className="h-4 w-4" />
                    )}
                    {mode === 'timeline' ? 'Timeline' : 'Gallery'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel rounded-[1.75rem] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                <SlidersHorizontal className="h-4 w-4" />
                Filter by category
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {categoryFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => handleFilterChange(filter)}
                    className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      effectiveActiveFilter === filter
                        ? 'text-white dark:text-slate-950'
                        : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {effectiveActiveFilter === filter ? (
                      <motion.span
                        layoutId="active-filter"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10">{filter}</span>
                    <span className="relative z-10 rounded-full bg-white/20 px-2 py-0.5 text-xs dark:bg-slate-900/30">
                      {filterCounts[filter] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    Year slider
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">
                    {effectiveSelectedYear === null ? 'All Years' : effectiveSelectedYear}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setSelectedYear(null)
                    })
                  }}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Show All
                </button>
              </div>

              <div className="mt-5">
                <input
                  aria-label="Filter memories by year"
                  className="year-slider w-full"
                  type="range"
                  min="0"
                  max={Math.max(availableYears.length - 1, 0)}
                  step="1"
                  value={activeYearIndex}
                  onChange={handleYearChange}
                  disabled={!availableYears.length}
                />
                <div className="mt-3 grid grid-cols-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)] sm:text-sm">
                  {(availableYears.length ? availableYears : [2023, 2024, 2025]).map(
                    (year) => (
                      <span key={year} className="text-center">
                        {year}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {deferredMemories.length > 0 ? (
            viewMode === 'timeline' ? (
              <Timeline memories={deferredMemories} onSelect={setSelectedMemory} />
            ) : (
              <Gallery memories={deferredMemories} onSelect={setSelectedMemory} />
            )
          ) : (
            <div className="glass-panel rounded-[1.75rem] px-6 py-14 text-center">
              <p className="font-display text-3xl font-semibold">
                No memories match this view yet.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
                Try switching the year, changing the active tag, or reset
                everything to reveal the full story again.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Reset Explorer
              </button>
            </div>
          )}
        </section>

        <section
          id="about"
          className="scroll-mt-28 grid gap-6 lg:grid-cols-[1fr_1fr]"
        >
          <div className="glass-panel-strong rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              About This Journey
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              Every event became part of our story
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              This collection is now fully based on your real photo folders,
              organized by event names and years exactly as provided.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/60 p-5 dark:bg-white/6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Story Scale
                </p>
                <p className="mt-3 font-display text-2xl font-semibold">{memories.length} Events</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Every card points to an actual image from your folders, with
                  captions aligned to each event name.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/60 p-5 dark:bg-white/6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  What You Can Explore
                </p>
                <p className="mt-3 font-display text-2xl font-semibold">
                  Memories We Lived
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Trip Murree Bhurban, Sports Culture Day, Movie Date, Coat
                  Check, and Last Day 11th Class are now mapped as real chapters.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-strong rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Memory Lens
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              From one event folder to the next
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Each memory includes a short caption, year-based dating, and a
              full-screen story view so your events feel connected as one journey.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'Photos are organized by folder names and year labels',
                'Filter by event types generated directly from your real data',
                'Switch between timeline and gallery for two memory views',
                'Open any card to read the full caption in story mode',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[var(--border)] bg-white/60 px-4 py-3 text-sm leading-6 text-[var(--muted)] dark:bg-white/6"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedMemory ? (
          <MemoryModal
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default App
