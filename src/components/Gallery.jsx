import MemoryCard from './MemoryCard'

const GALLERY_ASPECTS = ['4 / 5', '1 / 1', '4 / 3', '3 / 4', '5 / 4']

function Gallery({ memories, onSelect }) {
  return (
    <div className="columns-1 gap-5 md:columns-2 xl:columns-3 [column-gap:1.25rem]">
      {memories.map((memory, index) => (
        <div key={memory.id} className="masonry-item mb-5">
          <MemoryCard
            aspectRatio={GALLERY_ASPECTS[index % GALLERY_ASPECTS.length]}
            index={index}
            layout="gallery"
            memory={memory}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  )
}

export default Gallery