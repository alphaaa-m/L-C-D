import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays } from 'lucide-react'

function MemoryCard({ aspectRatio, index = 0, layout = 'timeline', memory, onSelect }) {
  const isGallery = layout === 'gallery'

  return (
    <motion.article
      layoutId={`memory-card-${memory.id}`}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <button
        type="button"
        onClick={() => onSelect(memory)}
        className="glass-panel block w-full overflow-hidden rounded-[1.8rem] text-left transition duration-300 hover:shadow-[0_28px_70px_rgba(79,70,229,0.16)]"
      >
        <div
          className={`relative overflow-hidden ${isGallery ? '' : 'aspect-[16/10]'}`}
          style={isGallery && aspectRatio ? { aspectRatio } : undefined}
        >
          <motion.img
            layoutId={`memory-image-${memory.id}`}
            src={memory.image}
            alt={memory.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
            <span className="rounded-full border border-white/20 bg-slate-950/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              {memory.occasionType}
            </span>
            <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {memory.year}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-medium backdrop-blur-md">
              <CalendarDays className="h-3.5 w-3.5" />
              {memory.date}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {memory.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            {memory.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={`${memory.id}-${tag}`}
                className="rounded-full border border-[var(--border)] bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-white/8 dark:text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition group-hover:translate-x-1 dark:text-indigo-200">
            View Story
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </button>
    </motion.article>
  )
}

export default MemoryCard