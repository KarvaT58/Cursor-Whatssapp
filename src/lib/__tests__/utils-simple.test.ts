import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatPhoneNumber, validateEmail } from '../utils'

describe('Utils', () => {
  describe('cn utility', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })
  })

  describe('formatDate utility', () => {
    it('should format date correctly', () => {
      const date = new Date(2023, 0, 1) // January 1, 2023
      expect(formatDate(date)).toBe('01/01/2023')
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

    it('should handle null and undefined', () => {
      expect(formatPhoneNumber(null)).toBe('')
      expect(formatPhoneNumber(undefined)).toBe('')
    })
  })

  describe('validateEmail utility', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })
  })
})
