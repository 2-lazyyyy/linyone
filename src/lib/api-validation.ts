/**
 * API validation middleware and helpers
 * Provides centralized request validation and error handling for all API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateAddress,
  validateNumber,
  validateLength,
  validateEnum,
  validateCoordinates
} from './validation'

export interface ApiValidationError {
  field: string
  message: string
}

export class ValidationError extends Error {
  constructor(public errors: ApiValidationError[]) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

export function validateRequestBody<T>(
  body: any,
  validator: (body: any) => { valid: boolean; errors?: ApiValidationError[] }
): T {
  const result = validator(body)
  if (!result.valid) {
    throw new ValidationError(result.errors || [])
  }
  return body as T
}

export function sendValidationError(errors: ApiValidationError[]) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors
    },
    { status: 400 }
  )
}

export function sendErrorResponse(message: string, statusCode: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status: statusCode }
  )
}

export function sendSuccessResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data
    },
    { status: statusCode }
  )
}

// Validation schemas for different request types
export const ApiValidationSchemas = {
  // User registration validation
  userRegistration: (body: any) => {
    const errors: ApiValidationError[] = []

    const nameVal = validateName(body.name, 'Name')
    if (!nameVal.valid) errors.push({ field: 'name', message: nameVal.error || 'Invalid name' })

    const emailVal = validateEmail(body.email)
    if (!emailVal.valid) errors.push({ field: 'email', message: emailVal.error || 'Invalid email' })

    const phoneVal = validatePhone(body.phone)
    if (!phoneVal.valid) errors.push({ field: 'phone', message: phoneVal.error || 'Invalid phone' })

    const passwordVal = validatePassword(body.password)
    if (!passwordVal.valid) errors.push({ field: 'password', message: passwordVal.error || 'Invalid password' })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Organization registration validation
  organizationRegistration: (body: any) => {
    const errors: ApiValidationError[] = []

    const nameVal = validateName(body.name, 'Organization Name')
    if (!nameVal.valid) errors.push({ field: 'name', message: nameVal.error || 'Invalid name' })

    const emailVal = validateEmail(body.email)
    if (!emailVal.valid) errors.push({ field: 'email', message: emailVal.error || 'Invalid email' })

    const phoneVal = validatePhone(body.phone)
    if (!phoneVal.valid) errors.push({ field: 'phone', message: phoneVal.error || 'Invalid phone' })

    const addressVal = validateAddress(body.address)
    if (!addressVal.valid) errors.push({ field: 'address', message: addressVal.error || 'Invalid address' })

    const passwordVal = validatePassword(body.password)
    if (!passwordVal.valid) errors.push({ field: 'password', message: passwordVal.error || 'Invalid password' })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Volunteer creation validation
  volunteerCreation: (body: any) => {
    const errors: ApiValidationError[] = []

    const nameVal = validateName(body.name, 'Volunteer Name')
    if (!nameVal.valid) errors.push({ field: 'name', message: nameVal.error || 'Invalid name' })

    const emailVal = validateEmail(body.email)
    if (!emailVal.valid) errors.push({ field: 'email', message: emailVal.error || 'Invalid email' })

    const phoneVal = validatePhone(body.phone)
    if (!phoneVal.valid) errors.push({ field: 'phone', message: phoneVal.error || 'Invalid phone' })

    const roleVal = validateEnum(body.role, ['tracking', 'normal'], { fieldName: 'Role' })
    if (!roleVal.valid) errors.push({ field: 'role', message: roleVal.error || 'Invalid role' })

    if (!body.organizationId || typeof body.organizationId !== 'string') {
      errors.push({ field: 'organizationId', message: 'Organization ID is required' })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Pin/Help request creation validation
  pinCreation: (body: any) => {
    const errors: ApiValidationError[] = []

    const titleVal = validateLength(body.title, { min: 1, max: 200, fieldName: 'Title' })
    if (!titleVal.valid) errors.push({ field: 'title', message: titleVal.error || 'Invalid title' })

    const descriptionVal = validateLength(body.description, { min: 0, max: 2000, fieldName: 'Description' })
    if (!descriptionVal.valid) errors.push({ field: 'description', message: descriptionVal.error || 'Invalid description' })

    const coordVal = validateCoordinates(body.lat, body.lng)
    if (!coordVal.valid) errors.push({ field: 'coordinates', message: coordVal.error || 'Invalid coordinates' })

    if (body.phone && !validatePhone(body.phone).valid) {
      errors.push({ field: 'phone', message: 'Invalid phone number' })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Supply management validation
  supplyCreation: (body: any) => {
    const errors: ApiValidationError[] = []

    const nameVal = validateLength(body.name, { min: 1, max: 100, fieldName: 'Supply Name' })
    if (!nameVal.valid) errors.push({ field: 'name', message: nameVal.error || 'Invalid name' })

    const quantityVal = validateNumber(body.quantity, { min: 0, fieldName: 'Quantity' })
    if (!quantityVal.valid) errors.push({ field: 'quantity', message: quantityVal.error || 'Invalid quantity' })

    const unitVal = validateLength(body.unit, { min: 1, max: 50, fieldName: 'Unit' })
    if (!unitVal.valid) errors.push({ field: 'unit', message: unitVal.error || 'Invalid unit' })

    const categoryVal = validateEnum(body.category, ['medical', 'food', 'water', 'shelter', 'equipment', 'other'], { fieldName: 'Category' })
    if (!categoryVal.valid) errors.push({ field: 'category', message: categoryVal.error || 'Invalid category' })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Reverse geocode validation
  reverseGeocode: (body: any) => {
    const errors: ApiValidationError[] = []

    const coordVal = validateCoordinates(body.lat, body.lng)
    if (!coordVal.valid) errors.push({ field: 'coordinates', message: coordVal.error || 'Invalid coordinates' })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Safe request parsing
export async function safeParseJSON(req: NextRequest): Promise<any> {
  try {
    return await req.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

// Validate required fields
export function validateRequiredFields(body: any, requiredFields: string[]): ApiValidationError[] {
  const errors: ApiValidationError[] = []
  
  for (const field of requiredFields) {
    if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
      errors.push({
        field,
        message: `${field} is required`
      })
    }
  }
  
  return errors
}

// Wrap API route handlers with error handling
export function withValidation(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      if (error instanceof ValidationError) {
        return sendValidationError(error.errors)
      }

      console.error('API Error:', error)
      const message = error instanceof Error ? error.message : 'Internal server error'
      return sendErrorResponse(message, 500)
    }
  }
}
