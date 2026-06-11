import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates calendar days between notice date and vacate date, normalizing to UTC midnight.
 */
export function calculateNoticeDays(noticeDate: string | Date, vacateDate: string | Date): number {
  const start = new Date(noticeDate)
  const end = new Date(vacateDate)
  
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  
  const diffTime = endUTC - startUTC
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Checks if a tenant is eligible for refund based on notice duration.
 */
export function isRefundEligible(noticeDate: string | Date, vacateDate: string | Date, minDays = 30): boolean {
  const days = calculateNoticeDays(noticeDate, vacateDate)
  return days >= minDays
}

/**
 * Formats a 12-digit Aadhaar number as "XXXX XXXX XXXX".
 */
export function formatAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\D/g, "")
  if (clean.length === 0) return ""
  const match = clean.match(/.{1,4}/g)
  return match ? match.join(" ") : clean
}

/**
 * Calculates days remaining from today until vacate date.
 */
export function getDaysRemaining(vacateDateStr: string | Date, today: string | Date = new Date()): number {
  const vacate = new Date(vacateDateStr)
  const current = new Date(today)
  
  const vacateUTC = Date.UTC(vacate.getFullYear(), vacate.getMonth(), vacate.getDate())
  const currentUTC = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())
  
  const diffTime = vacateUTC - currentUTC
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

