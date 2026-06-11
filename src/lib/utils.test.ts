import { describe, it, expect } from 'vitest'
import { cn, calculateNoticeDays, isRefundEligible, formatAadhaar, getDaysRemaining } from './utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should resolve tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })
})

describe('calculateNoticeDays', () => {
  it('should calculate correct days between dates', () => {
    expect(calculateNoticeDays('2026-06-01', '2026-07-01')).toBe(30)
  })

  it('should handle leap years correctly', () => {
    expect(calculateNoticeDays('2024-02-28', '2024-03-01')).toBe(2)
  })

  it('should handle zero days', () => {
    expect(calculateNoticeDays('2026-06-01', '2026-06-01')).toBe(0)
  })
})

describe('isRefundEligible', () => {
  it('should return true if notice days >= 30', () => {
    expect(isRefundEligible('2026-06-01', '2026-07-01')).toBe(true)
  })

  it('should return false if notice days < 30', () => {
    expect(isRefundEligible('2026-06-01', '2026-06-20')).toBe(false)
  })
})

describe('formatAadhaar', () => {
  it('should format 12 digits correctly', () => {
    expect(formatAadhaar('123456789012')).toBe('1234 5678 9012')
  })

  it('should ignore non-digit characters', () => {
    expect(formatAadhaar('1234-5678-9012')).toBe('1234 5678 9012')
  })

  it('should return empty string for empty input', () => {
    expect(formatAadhaar('')).toBe('')
  })
})

describe('getDaysRemaining', () => {
  it('should calculate days remaining', () => {
    expect(getDaysRemaining('2026-06-15', '2026-06-10')).toBe(5)
  })

  it('should return negative days if date is in the past', () => {
    expect(getDaysRemaining('2026-06-05', '2026-06-10')).toBe(-5)
  })
})

