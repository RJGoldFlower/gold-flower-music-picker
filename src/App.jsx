import { useState, useRef, useEffect } from 'react'
import tracks from './tracks.json'
import TrackCard from './components/TrackCard.jsx'

// Submission endpoint — set VITE_SUBMIT_URL in .env (or Vercel env vars) to point
// to the deployed admin server. Falls back to localhost for local development.
const SUBMIT_URL = import.meta.env.VITE_SUBMIT_URL || '/api/submit'

const ALL_TAGS = ['all', ...Array.from(new Set(tracks.flatMap(t => t.tags))).sort()]

const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#F5C518',
  textTransform: 'uppercase',
  marginBottom: 8,
  display: 'block',
}

const INPUT_STYLE = {
  width: '100%',
  background: '#1e1e1e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  padding: '10px 14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

export default function App() {
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [letUsPick, setLetUsPick] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [playingId, setPlayingId] = useState(null)
  const [progress, setProgress] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const audioRef = useRef(null)
  const previewEndRef = useRef(null)

  // Set up audio event listeners
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const PREVIEW_DURATION = 10

    const handleLoadedMetadata = () => {
      const dur = audio.duration
      if (!dur) return
      // Seek to middle minus half preview window, clamped to valid range
      const startAt = Math.max(0, Math.min(dur / 2 - PREVIEW_DURATION / 2, dur - PREVIEW_DURATION))
      audio.currentTime = startAt
      previewEndRef.current = startAt + Math.min(PREVIEW_DURATION, dur)
    }

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      // Stop when preview window ends
      if (previewEndRef.current !== null && audio.currentTime >= previewEndRef.current) {
        audio.pause()
        setProgress(prev => ({ ...prev, [audio._trackId]: 0 }))
        setPlayingId(null)
        previewEndRef.current = null
        return
      }
      // Progress relative to preview window
      const previewStart = previewEndRef.current !== null
        ? previewEndRef.current - Math.min(PREVIEW_DURATION, audio.duration)
        : 0
      const elapsed = audio.currentTime - previewStart
      const pct = Math.min(100, (elapsed / PREVIEW_DURATION) * 100)
      setProgress(prev => ({ ...prev, [audio._trackId]: pct }))
    }

    const handleEnded = () => {
      setProgress(prev => ({ ...prev, [audio._trackId]: 0 }))
      setPlayingId(null)
      previewEndRef.current = null
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  }, [])

  const handlePlayPause = (track) => {
    const audio = audioRef.current
    if (!audio) return

    if (playingId === track.id) {
      // Toggle same track
      if (audio.paused) {
        audio.play()
        setPlayingId(track.id)
      } else {
        audio.pause()
        setPlayingId(null)
      }
    } else {
      // Switch to new track
      audio.pause()
      previewEndRef.current = null
      audio.src = track.previewUrl
      audio._trackId = track.id
      audio.load()
      audio.play().catch(() => {})
      setPlayingId(track.id)
    }
  }

  const stopAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = ''
    }
    setPlayingId(null)
  }

  const handleSelectTrack = (id) => {
    setSelectedTrack(prev => prev === id ? null : id)
    setLetUsPick(false)
  }

  const handleLetUsPick = () => {
    setLetUsPick(prev => {
      if (!prev) stopAudio()
      return !prev
    })
    setSelectedTrack(null)
  }

  const filtered = activeFilter === 'all'
    ? tracks
    : tracks.filter(t => t.tags.includes(activeFilter))

  const hasSelection = selectedTrack !== null || letUsPick
  const selectedTrackObj = tracks.find(t => t.id === selectedTrack)
  const canSubmit = hasSelection && firstName.trim() && lastName.trim() && email.trim() && address.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    setSubmitError('')

    const musicSelection = letUsPick
      ? 'Let Gold Flower Media choose'
      : `"${selectedTrackObj.title}" by ${selectedTrackObj.artist}`

    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, address, notes, musicSelection }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error || 'Submission failed. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: '#1e1e1e',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
        }}>
          {/* Yellow check circle */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#F5C518',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <path d="M2 10L10.5 18.5L26 2" stroke="#141414" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Montserrat Alternates', sans-serif", fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            We got it — thanks!
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
            Your music selection has been submitted. The Gold Flower Media team will use it for your listing video.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 20px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ ...LABEL_STYLE }}>Gold Flower Media</span>
        <h1 style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.15,
          marginBottom: 14,
        }}>
          Pick Your Listing Music
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 520, lineHeight: 1.7, marginBottom: 16 }}>
          Choose the background track for your property video, or let us select one that fits your home's vibe.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(245,197,24,0.1)',
          border: '1px solid rgba(245,197,24,0.25)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 12,
          color: '#F5C518',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#F5C518" strokeWidth="1.5" />
            <path d="M7 6v4M7 4.5v.5" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Preview clips are ~60 seconds · Licensed via Artlist
        </div>
      </div>

      {/* Mood filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            style={{
              background: activeFilter === tag ? '#F5C518' : 'rgba(255,255,255,0.07)',
              color: activeFilter === tag ? '#141414' : 'rgba(255,255,255,0.65)',
              border: 'none',
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'capitalize',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Track grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 12,
      }}>
        {filtered.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            isSelected={selectedTrack === track.id}
            onSelect={handleSelectTrack}
            isPlaying={playingId === track.id}
            onPlayPause={handlePlayPause}
            progress={progress[track.id] ?? 0}
          />
        ))}
      </div>

      {/* Let us choose card */}
      <div
        onClick={handleLetUsPick}
        style={{
          border: letUsPick ? '2px solid #F5C518' : '2px dashed rgba(245,197,24,0.3)',
          borderRadius: 12,
          padding: '18px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: letUsPick ? 'rgba(245,197,24,0.07)' : 'transparent',
          marginBottom: 48,
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: letUsPick ? '#F5C518' : 'rgba(245,197,24,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}>
          {letUsPick ? (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 7L6.5 12.5L17 1" stroke="#141414" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3v12M3 9h12" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
            Let Gold Flower Media choose
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            We'll pick a track that perfectly matches your listing's style
          </div>
        </div>
      </div>

      {/* Form section */}
      <div style={{
        opacity: hasSelection ? 1 : 0.4,
        pointerEvents: hasSelection ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}>
        <h2 style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 6,
        }}>
          Your Info
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
          We'll attach your music selection to your listing file.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL_STYLE}>First Name *</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="Jane"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Last Name *</label>
              <input
                style={INPUT_STYLE}
                type="text"
                placeholder="Smith"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={LABEL_STYLE}>Email *</label>
              <input
                style={INPUT_STYLE}
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={LABEL_STYLE}>Phone</label>
              <input
                style={INPUT_STYLE}
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL_STYLE}>Listing Address *</label>
            <input
              style={INPUT_STYLE}
              type="text"
              placeholder="123 Maple St, San Francisco, CA 94110"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 28 }}>
            <label style={LABEL_STYLE}>Notes (optional)</label>
            <textarea
              style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 80 }}
              placeholder="Any additional notes for the video editor…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Selection summary */}
          {hasSelection && (
            <div style={{
              background: 'rgba(245,197,24,0.08)',
              border: '1px solid rgba(245,197,24,0.2)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
            }}>
              <span style={{ color: '#F5C518', fontWeight: 600 }}>Selected: </span>
              {letUsPick
                ? 'Let Gold Flower Media choose'
                : `"${selectedTrackObj?.title}" by ${selectedTrackObj?.artist}`}
            </div>
          )}

          {/* Error */}
          {submitError && (
            <div style={{
              background: 'rgba(255,80,80,0.1)',
              border: '1px solid rgba(255,80,80,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: '#ff8080',
            }}>
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            style={{
              width: '100%',
              background: canSubmit ? '#F5C518' : 'rgba(255,255,255,0.1)',
              color: canSubmit ? '#141414' : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: 10,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'background 0.15s, color 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Music Selection'}
          </button>
        </form>
      </div>
    </div>
  )
}
