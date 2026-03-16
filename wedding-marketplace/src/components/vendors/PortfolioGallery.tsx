'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function PortfolioGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="aspect-square relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedImage(img)}
          >
            <Image
              src={img}
              alt={`Portfolio Image ${i + 1}`}
              fill
              unoptimized // using standard img due to external urls without configuration
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black/80 w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null) }}
          >
            ✕
          </button>
          <div 
            className="relative w-full max-w-5xl h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Fullscreen Portfolio"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  )
}
