import MemoryCard from './MemoryCard'

function Timeline({ memories, onSelect }) {
  const groups = memories.reduce((collection, memory) => {
    const nextCollection = collection
    const yearKey = String(memory.year)

    if (!nextCollection[yearKey]) {
      nextCollection[yearKey] = []
    }

    nextCollection[yearKey].push(memory)
    return nextCollection
  }, {})

  const years = Object.keys(groups).sort((left, right) => Number(left) - Number(right))

  return (
    <div className="relative pl-0 sm:pl-10">
      <div className="absolute bottom-0 left-3 top-0 hidden w-px bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-transparent sm:block" />

      <div className="space-y-14">
        {years.map((year) => (
          <section key={year} className="relative">
            <div className="mb-6 flex items-center gap-4">
              <div className="hidden h-6 w-6 items-center justify-center rounded-full border border-indigo-400/40 bg-white shadow-md dark:bg-slate-950 sm:flex">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Chapter
                </p>
                <h3 className="font-display text-4xl font-semibold">{year}</h3>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {groups[year].map((memory, index) => (
                <MemoryCard
                  key={memory.id}
                  index={index}
                  memory={memory}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Timeline