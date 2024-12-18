interface CacheItem<T> {
  value: T
  expiry: number
}

class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()

  set(key: string, value: T, ttl: number) {
    const expiry = Date.now() + ttl
    this.cache.set(key, { value, expiry })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const sessionCache = new Cache<string>() 