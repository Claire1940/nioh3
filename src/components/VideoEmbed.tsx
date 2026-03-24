interface VideoEmbedProps {
  videoId: string
  title: string
}

export function VideoEmbed({ videoId, title }: VideoEmbedProps) {
  return (
    <div className="video-embed-container" style={{
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      margin: '2rem 0',
      overflow: 'hidden',
      borderRadius: '0.5rem'
    }}>
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
