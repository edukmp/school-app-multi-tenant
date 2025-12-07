import React, { useState, useEffect, useRef } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    placeholder?: string
    threshold?: number
}

/**
 * Lazy loading image component with intersection observer
 * Only loads images when they're about to enter viewport
 */
const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    threshold = 0.1,
    className = '',
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder)
    const [isLoaded, setIsLoaded] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
        if (!imgRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(src)
                        observer.disconnect()
                    }
                })
            },
            { threshold }
        )

        observer.observe(imgRef.current)

        return () => {
            observer.disconnect()
        }
    }, [src, threshold])

    const handleLoad = () => {
        setIsLoaded(true)
    }

    return (
        <img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            onLoad={handleLoad}
            className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
            style={{
                transition: 'opacity 0.3s ease-in-out',
                opacity: isLoaded ? 1 : 0.5,
            }}
            {...props}
        />
    )
}

export default LazyImage
