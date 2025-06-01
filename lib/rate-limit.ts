// Simple in-memory rate limiter pour protéger les endpoints sensibles
// En production, utiliser Redis ou un service dédié

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const key = `rate-limit:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre
    entry = {
      count: 0,
      resetTime: now + windowMs
    }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  
  const allowed = entry.count <= maxAttempts
  const remaining = Math.max(0, maxAttempts - entry.count)
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime
  }
}