export default function TrackCard({ track, isSelected, onSelect, isPlaying, onPlayPause, progress }) {
  const hasRealUrl = !track.previewUrl.includes('REPLACE')

  const cardStyle = {
    background: '#222',
    borderRadius: 12,
    border: isSelected ? '2px solid #F5C518' : '1px solid rgba(255,255,255,0.08)',
    padding: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'border-color 0.15s ease',
    userSelect: 'none',
  }

  const handleCardClick = (e) => {
    // Don't select when clicking play button
    if (e.target.closest('[data-play-btn]')) return
    onSelect(track.id)
  }

  const handlePlayClick = (e) => {
    e.stopPropagation()
    if (hasRealUrl) onPlayPause(track)
  }

  const pct = progress ?? 0

  return (
    <div style={cardStyle} onClick={handleCardClick}>
      {/* Selected checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#F5C518',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="#141414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 4, paddingRight: isSelected ? 28 : 0 }}>
        {track.title}
      </div>

      {/* Artist + BPM */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>
        {track.artist} · {track.bpm} BPM
      </div>

      {/* Mood tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {track.tags.map(tag => (
          <span key={tag} style={{
            background: '#333',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 11,
            padding: '3px 9px',
            borderRadius: 20,
            fontWeight: 500,
            textTransform: 'capitalize',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom row: play + progress + duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Play/pause button */}
        <button
          data-play-btn
          onClick={handlePlayClick}
          title={hasRealUrl ? (isPlaying ? 'Pause' : 'Play') : 'Preview not yet available'}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: hasRealUrl ? '#F5C518' : 'rgba(255,255,255,0.1)',
            border: 'none',
            cursor: hasRealUrl ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
        >
          {isPlaying ? (
            /* Pause icon */
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <rect x="0" y="0" width="3" height="12" rx="1" fill={hasRealUrl ? '#141414' : 'rgba(255,255,255,0.4)'} />
              <rect x="7" y="0" width="3" height="12" rx="1" fill={hasRealUrl ? '#141414' : 'rgba(255,255,255,0.4)'} />
            </svg>
          ) : (
            /* Play icon */
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path d="M1 1L9 6L1 11V1Z" fill={hasRealUrl ? '#141414' : 'rgba(255,255,255,0.4)'} />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div style={{
          flex: 1,
          height: 3,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: '#F5C518',
            borderRadius: 2,
            transition: 'width 0.25s linear',
          }} />
        </div>

        {/* Duration */}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
          {track.duration}
        </span>
      </div>
    </div>
  )
}
