import { useEffect, useEffectEvent } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Tag, X } from 'lucide-react'

function MemoryModal({ memory, onClose }) {
  const handleClose = useEffectEvent(() => {
    onClose()
  })

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/72 px-4 py-5 backdrop-blur-lg sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        layoutId={`memory-card-${memory.id}`}
        className="glass-panel-strong relative max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[2rem]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 250, damping: 24 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/60 text-white backdrop-blur-md transition hover:bg-slate-950/80"
          aria-label="Close memory"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[94vh] overflow-y-auto lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px] lg:min-h-full">
            <motion.img
              layoutId={`memory-image-${memory.id}`}
              src={memory.image}
              alt={memory.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-md">
                {memory.occasionType}
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
                {memory.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[var(--muted)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 dark:bg-white/8">
                <CalendarDays className="h-4 w-4" />
                {memory.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 dark:bg-white/8">
                <Tag className="h-4 w-4" />
                {memory.tags.length} tags
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Story
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--muted)] sm:text-lg">
                {memory.fullDescription}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {memory.tags.map((tag) => (
                  <span
                    key={`${memory.id}-${tag}`}
                    className="rounded-full border border-[var(--border)] bg-indigo-500/10 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MemoryModal