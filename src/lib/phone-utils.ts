/**
 * Phone number validation and normalization utilities
 */

export interface PhoneValidationResult {
  isValid: boolean
  normalized: string | null
  error?: string
}

/**
 * Normalizes a phone number to a consistent format
 * Removes all non-numeric characters and ensures proper format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // If it starts with 55 (Brazil country code), keep it
  if (cleaned.startsWith('55')) {
    return cleaned
  }

  // If it doesn't start with 55, add it
  return `55${cleaned}`
}

/**
 * Validates if a phone number has the required DDD (area code)
 * Brazilian phone numbers must have at least 2 digits for DDD + 8 or 9 digits for the number
 */
export function validatePhoneWithDDD(phone: string): PhoneValidationResult {
  const normalized = normalizePhoneNumber(phone)

  // Check if it's empty
  if (!normalized || normalized.length === 0) {
    return {
      isValid: false,
      normalized: null,
      error: 'Número de telefone é obrigatório',
    }
  }

  // Check if it starts with 55 (Brazil country code)
  if (!normalized.startsWith('55')) {
    return {
      isValid: false,
      normalized: null,
      error: 'Número deve incluir o código do país (55)',
    }
  }

  // Remove country code to check DDD
  const withoutCountryCode = normalized.substring(2)

  // Check minimum length (DDD + number)
  if (withoutCountryCode.length < 10) {
    return {
      isValid: false,
      normalized: null,
      error: 'Número deve ter DDD + pelo menos 8 dígitos',
    }
  }

  // Check maximum length (DDD + 9 digits for mobile)
  if (withoutCountryCode.length > 11) {
    return {
      isValid: false,
      normalized: null,
      error: 'Número muito longo',
    }
  }

  // Extract DDD (first 2 digits after country code)
  const ddd = withoutCountryCode.substring(0, 2)

  // Validate DDD (Brazilian area codes are 11-99)
  const dddNumber = parseInt(ddd, 10)
  if (dddNumber < 11 || dddNumber > 99) {
    return {
      isValid: false,
      normalized: null,
      error: 'DDD inválido. Deve estar entre 11 e 99',
    }
  }

  return {
    isValid: true,
    normalized,
  }
}

/**
 * Formats a normalized phone number for display
 */
export function formatPhoneForDisplay(normalizedPhone: string): string {
  if (!normalizedPhone || normalizedPhone.length < 13) {
    return normalizedPhone
  }

  // Remove country code for display
  const withoutCountryCode = normalizedPhone.substring(2)

  if (withoutCountryCode.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${withoutCountryCode.substring(0, 2)}) ${withoutCountryCode.substring(2, 6)}-${withoutCountryCode.substring(6)}`
  } else if (withoutCountryCode.length === 11) {
    // Mobile: (XX) 9XXXX-XXXX
    return `(${withoutCountryCode.substring(0, 2)}) ${withoutCountryCode.substring(2, 7)}-${withoutCountryCode.substring(7)}`
  }

  return normalizedPhone
}

/**
 * Checks if two phone numbers are the same (considering different formats)
 */
export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  const normalized1 = normalizePhoneNumber(phone1)
  const normalized2 = normalizePhoneNumber(phone2)
  return normalized1 === normalized2
}

/**
 * Validates and normalizes a phone number for database storage
 */
export function processPhoneForStorage(phone: string): PhoneValidationResult {
  const validation = validatePhoneWithDDD(phone)

  if (!validation.isValid) {
    return validation
  }

  return {
    isValid: true,
    normalized: validation.normalized,
  }
}
