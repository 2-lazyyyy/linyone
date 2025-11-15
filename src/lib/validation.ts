/**
 * Comprehensive validation utilities for the entire application
 * Provides strict validation for all input types across the web app
 */

// Email validation - RFC 5322 compliant
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const trimmed = email.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' }
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  const [local] = trimmed.split('@')
  if (local.length > 64) {
    return { valid: false, error: 'Email local part is too long' }
  }

  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

// Password validation - enforce strong passwords
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required', strength: 'none' }
  }

  if (password.length < 8) {
    return { 
      valid: false, 
      error: 'Password must be at least 8 characters long',
      strength: 'weak'
    }
  }

  if (password.length > 128) {
    return { 
      valid: false, 
      error: 'Password is too long (max 128 characters)',
      strength: 'weak'
    }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  const strengthScore = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length

  if (strengthScore < 2) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, numbers, and special characters',
      strength: 'weak'
    }
  }

  let strength = 'medium'
  if (strengthScore >= 3) strength = 'strong'
  if (strengthScore === 4 && password.length >= 12) strength = 'very-strong'

  return { valid: true, strength }
}

// Phone number validation - Myanmar format support
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }

  const trimmed = phone.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Phone number cannot be empty' }
  }

  // Remove common separators
  const cleaned = trimmed.replace(/[\s\-()]+/g, '')
  
  if (!/^\+?[\d]{7,15}$/.test(cleaned)) {
    return { valid: false, error: 'Phone number must be 7-15 digits (with optional + prefix)' }
  }

  // Myanmar phone format check
  if (trimmed.startsWith('+959') || trimmed.startsWith('09')) {
    if (!/^(\+959|09)\d{7,9}$/.test(cleaned)) {
      return { valid: false, error: 'Invalid Myanmar phone number format' }
    }
  }

  return { valid: true }
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` }
  }

  const trimmed = name.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` }
  }

  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: `${fieldName} must be less than 100 characters` }
  }

  // Allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\u1000-\u109F\s\-']{2,100}$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }

  return { valid: true }
}

// Address validation
export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' }
  }

  const trimmed = address.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Address cannot be empty' }
  }

  if (trimmed.length < 5) {
    return { valid: false, error: 'Address must be at least 5 characters' }
  }

  if (trimmed.length > 250) {
    return { valid: false, error: 'Address must be less than 250 characters' }
  }

  return { valid: true }
}

// URL validation
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' }
  }

  const trimmed = url.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'URL cannot be empty' }
  }

  try {
    new URL(trimmed)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// Number validation with optional range
export function validateNumber(
  value: any,
  options: { min?: number; max?: number; fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { min, max, fieldName = 'Number' } = options

  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` }
  }

  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` }
  }

  return { valid: true }
}

// Coordinates validation
export function validateCoordinates(lat: any, lng: any): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Coordinates must be numbers' }
  }

  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Coordinates cannot be NaN' }
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' }
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' }
  }

  return { valid: true }
}

// File validation
export function validateFile(
  file: any,
  options: { maxSize?: number; mimeTypes?: string[]; fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, mimeTypes = [], fieldName = 'File' } = options

  if (!file) {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (!(file instanceof File)) {
    return { valid: false, error: `${fieldName} must be a file` }
  }

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `${fieldName} size must be less than ${(maxSize / 1024 / 1024).toFixed(2)}MB` 
    }
  }

  if (mimeTypes.length > 0 && !mimeTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `${fieldName} type must be one of: ${mimeTypes.join(', ')}` 
    }
  }

  return { valid: true }
}

// Date validation
export function validateDate(dateString: string, options: { fieldName?: string } = {}): { valid: boolean; error?: string } {
  const { fieldName = 'Date' } = options

  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: `${fieldName} is required` }
  }

  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} must be a valid date` }
  }

  return { valid: true }
}

// Password match validation
export function validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (!password || !confirmPassword) {
    return { valid: false, error: 'Both passwords are required' }
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' }
  }

  return { valid: true }
}

// Text length validation
export function validateLength(
  text: string,
  options: { min?: number; max?: number; fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { min, max, fieldName = 'Text' } = options

  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldName} is required` }
  }

  const length = text.trim().length

  if (min !== undefined && length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` }
  }

  if (max !== undefined && length > max) {
    return { valid: false, error: `${fieldName} must be at most ${max} characters` }
  }

  return { valid: true }
}

// Enum validation
export function validateEnum<T>(
  value: any,
  validValues: readonly T[],
  options: { fieldName?: string } = {}
): { valid: boolean; error?: string } {
  const { fieldName = 'Value' } = options

  if (!validValues.includes(value)) {
    return { 
      valid: false, 
      error: `${fieldName} must be one of: ${(validValues as any[]).join(', ')}` 
    }
  }

  return { valid: true }
}

// Batch validation helper
export function validateBatch(
  validations: Array<{ valid: boolean; error?: string }>
): { valid: boolean; errors: string[] } {
  const errors = validations
    .filter(v => !v.valid)
    .map(v => v.error)
    .filter((error): error is string => !!error)

  return {
    valid: errors.length === 0,
    errors
  }
}

// Sanitize input (basic XSS prevention)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Common field validation schemas
export const ValidationSchemas = {
  userRegistration: {
    name: (value: string) => validateName(value, 'Name'),
    email: (value: string) => validateEmail(value),
    phone: (value: string) => validatePhone(value),
    password: (value: string) => validatePassword(value),
    confirmPassword: (value: string) => validateLength(value, { min: 8, max: 128, fieldName: 'Confirm Password' })
  },

  organizationRegistration: {
    name: (value: string) => validateName(value, 'Organization Name'),
    email: (value: string) => validateEmail(value),
    phone: (value: string) => validatePhone(value),
    address: (value: string) => validateAddress(value),
    password: (value: string) => validatePassword(value)
  },

  volunteer: {
    name: (value: string) => validateName(value, 'Volunteer Name'),
    email: (value: string) => validateEmail(value),
    phone: (value: string) => validatePhone(value),
    role: (value: string) => validateEnum(value, ['tracking_volunteer', 'supply_volunteer'], { fieldName: 'Role' })
  },

  supply: {
    name: (value: string) => validateLength(value, { min: 1, max: 100, fieldName: 'Supply Name' }),
    quantity: (value: number) => validateNumber(value, { min: 0, fieldName: 'Quantity' }),
    unit: (value: string) => validateLength(value, { min: 1, max: 50, fieldName: 'Unit' }),
    category: (value: string) => validateEnum(value, ['medical', 'food', 'water', 'shelter', 'equipment', 'other'], { fieldName: 'Category' })
  },

  helpRequest: {
    title: (value: string) => validateLength(value, { min: 5, max: 200, fieldName: 'Title' }),
    description: (value: string) => validateLength(value, { min: 10, max: 2000, fieldName: 'Description' }),
    location: (value: string) => validateLength(value, { min: 2, max: 250, fieldName: 'Location' }),
    phone: (value: string) => validatePhone(value)
  },

  pin: {
    title: (value: string) => validateLength(value, { min: 1, max: 200, fieldName: 'Title' }),
    description: (value: string) => validateLength(value, { min: 0, max: 2000, fieldName: 'Description' }),
    lat: (value: number) => validateNumber(value, { min: -90, max: 90, fieldName: 'Latitude' }),
    lng: (value: number) => validateNumber(value, { min: -180, max: 180, fieldName: 'Longitude' })
  }
}
