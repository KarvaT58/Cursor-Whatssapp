import { vi } from 'vitest'
import {
  cn,
  formatDate,
  formatPhoneNumber,
  validateEmail,
  debounce,
  throttle,
} from '../utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe(
      'class1 class2'
    )
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('should handle empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ class1: true, class2: false, class3: true })).toBe(
      'class1 class3'
    )
  })
})

describe('formatDate utility', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('should handle different date formats', () => {
    const date = new Date('2024-12-25T15:45:30Z')
    const formatted = formatDate(date, 'YYYY-MM-DD')
    expect(formatted).toBe('2024-12-25')
  })

  it('should handle invalid dates', () => {
    const invalidDate = new Date('invalid')
    const formatted = formatDate(invalidDate)
    expect(formatted).toBe('Invalid Date')
  })

  it('should handle null and undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

describe('formatPhoneNumber utility', () => {
  it('should format phone number correctly', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890')
  })

  it('should handle phone number with country code', () => {
    expect(formatPhoneNumber('12345678901')).toBe('+1 (234) 567-8901')
  })

  it('should handle already formatted numbers', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890')
  })

  it('should handle invalid phone numbers', () => {
    expect(formatPhoneNumber('123')).toBe('123')
    expect(formatPhoneNumber('')).toBe('')
  })

  it('should handle null and undefined', () => {
    expect(formatPhoneNumber(null)).toBe('')
    expect(formatPhoneNumber(undefined)).toBe('')
  })
})

describe('validateEmail utility', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('user+tag@example.org')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('test.example.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  it('should handle null and undefined', () => {
    expect(validateEmail(null)).toBe(false)
    expect(validateEmail(undefined)).toBe(false)
  })
})

describe('debounce utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1')
    debouncedFn('arg2')
    debouncedFn('arg3')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('arg3')
  })

  it('should handle immediate execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100, true)

    debouncedFn('arg1')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg1')

    debouncedFn('arg2')
    expect(mockFn).toHaveBeenCalledTimes(1) // Still only called once

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('arg2')
  })
})

describe('throttle utility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throttle function calls', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100)

    throttledFn('arg1')
    expect(mockFn).toHaveBeenCalledTimes(1)

    throttledFn('arg2')
    throttledFn('arg3')
    expect(mockFn).toHaveBeenCalledTimes(1) // Still only called once

    vi.advanceTimersByTime(100)
    throttledFn('arg4')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should handle leading edge execution', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100, {
      leading: true,
      trailing: false,
    })

    throttledFn('arg1')
    expect(mockFn).toHaveBeenCalledTimes(1)

    throttledFn('arg2')
    expect(mockFn).toHaveBeenCalledTimes(1) // Still only called once

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1) // No trailing call
  })

  it('should handle trailing edge execution', () => {
    const mockFn = vi.fn()
    const throttledFn = throttle(mockFn, 100, {
      leading: false,
      trailing: true,
    })

    throttledFn('arg1')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg1')
  })
})
