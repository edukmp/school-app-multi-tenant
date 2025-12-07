// Supabase Query Optimization Utilities
// Caching and query optimization helpers

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

class QueryCache {
    private cache: Map<string, CacheEntry<any>> = new Map()
    private defaultTTL = 5 * 60 * 1000 // 5 minutes

    /**
     * Get cached data if valid
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) return null

        const now = Date.now()
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            return null
        }

        return entry.data as T
    }

    /**
     * Set cache data with TTL
     */
    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        })
    }

    /**
     * Invalidate specific cache key
     */
    invalidate(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Invalidate all cache entries matching pattern
     */
    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern)
        Array.from(this.cache.keys()).forEach(key => {
            if (regex.test(key)) {
                this.cache.delete(key)
            }
        })
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear()
    }

    /**
     * Get cache stats
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        }
    }
}

// Singleton instance
export const queryCache = new QueryCache()

/**
 * Cached query wrapper
 */
export async function cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
): Promise<T> {
    // Check cache first
    const cached = queryCache.get<T>(key)
    if (cached !== null) {
        console.log(`[Cache HIT] ${key}`)
        return cached
    }

    // Execute query
    console.log(`[Cache MISS] ${key}`)
    const data = await queryFn()

    // Store in cache
    queryCache.set(key, data, ttl)

    return data
}

/**
 * Batch query helper
 * Combines multiple queries into single request
 */
export async function batchQueries<T extends Record<string, () => Promise<any>>>(
    queries: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
    const entries = Object.entries(queries)
    const results = await Promise.all(
        entries.map(([_, queryFn]) => queryFn())
    )

    return Object.fromEntries(
        entries.map(([key], index) => [key, results[index]])
    ) as any
}

/**
 * Optimized pagination helper
 */
export interface PaginationOptions {
    page: number
    limit: number
}

export interface PaginatedResult<T> {
    data: T[]
    total: number
    page: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export function calculatePagination(
    page: number,
    limit: number
): { from: number; to: number } {
    const from = (page - 1) * limit
    const to = from + limit - 1
    return { from, to }
}

export function formatPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit)

    return {
        data,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    }
}

/**
 * Query retry with exponential backoff
 */
export async function retryQuery<T>(
    queryFn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await queryFn()
        } catch (error) {
            lastError = error as Error

            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt)
                console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError
}
