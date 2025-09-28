import { useState } from 'react'

type SafeImageProps = {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export default function SafeImage({ src, alt, className, fallbackSrc = '/assets/hero-placeholder.svg' }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  if (hasError) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center ${className || ''}`}>
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className || ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse rounded" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}


