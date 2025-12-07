// Performance Optimization Utilities
// Memoization and lazy loading helpers

import { lazy, ComponentType } from 'react'

/**
 * Lazy load component with retry logic
 * Handles network failures gracefully
 */
export function lazyWithRetry<T extends ComponentType<any>>(
    componentImport: () => Promise<{ default: T }>,
    retries = 3,
    interval = 1000
): ReturnType<typeof lazy> {
    return lazy(() => {
        return new Promise<{ default: T }>((resolve, reject) => {
            const attemptImport = (attemptsLeft: number) => {
                componentImport()
                    .then(resolve)
                    .catch((error) => {
                        if (attemptsLeft === 1) {
                            reject(error)
                            return
                        }

                        setTimeout(() => {
                            attemptImport(attemptsLeft - 1)
                        }, interval)
                    })
            }

            attemptImport(retries)
        })
    })
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null
            func(...args)
        }

        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

/**
 * Throttle function for scroll/resize events
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

/**
 * Check if element is in viewport
 * Useful for lazy loading images
 */
export function isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Memoize expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map()

    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args)

        if (cache.has(key)) {
            return cache.get(key)
        }

        const result = fn(...args)
        cache.set(key, result)
        return result
    }) as T
}
