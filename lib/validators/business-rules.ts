/**
 * Business logic and validation rules
 */

/**
 * Check if user can request password reset
 */
export const canRequestPasswordReset = (lastResetDate: Date | null): boolean => {
  if (!lastResetDate) return true
  
  const hoursSinceLastReset = 
    (Date.now() - lastResetDate.getTime()) / (1000 * 60 * 60)
  
  return hoursSinceLastReset >= 1 // Allow one reset per hour
}

/**
 * Validate if email domain is allowed (for corporate restrictions)
 */
export const isEmailDomainAllowed = (email: string, allowedDomains?: string[]): boolean => {
  if (!allowedDomains || allowedDomains.length === 0) return true
  
  const domain = email.split('@')[1]
  return allowedDomains.includes(domain)
}

/**
 * Check if account can be created (rate limiting)
 */
export const canCreateAccount = (
  ipAddress: string, 
  recentAttempts: { ip: string; timestamp: Date }[]
): boolean => {
  const maxAttemptsPerHour = 3
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  const recentAttemptsFromIP = recentAttempts.filter(
    attempt => attempt.ip === ipAddress && attempt.timestamp > oneHourAgo
  )
  
  return recentAttemptsFromIP.length < maxAttemptsPerHour
}