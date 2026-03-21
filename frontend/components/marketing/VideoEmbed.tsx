"use client"

interface VideoEmbedProps {
  youtubeId?: string
  title: string
}

export function VideoEmbed({ youtubeId, title }: VideoEmbedProps) {
  // If no YouTube ID is provided, render nothing gracefully
  if (!youtubeId) {
    return null
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black shadow-lg mb-12">
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
