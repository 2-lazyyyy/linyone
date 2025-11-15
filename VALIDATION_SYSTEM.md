# Strict Validation System

This document outlines the comprehensive validation system implemented across the LinnYone web application. The system provides strict input validation, error handling, and data integrity throughout the entire application.

## Overview

The validation system is composed of three main layers:

1. **Client-Side Validation** - Real-time validation in forms with immediate user feedback
2. **Server-Side Validation** - Request validation in API routes before database operations
3. **Service-Level Validation** - Input validation in business logic functions

## Components

### 1. Core Validation Library (`src/lib/validation.ts`)

Provides comprehensive validation functions for all input types:

#### Email Validation
```typescript
validateEmail(email: string): { valid: boolean; error?: string }
```
- RFC 5322 compliant email validation
- Maximum length: 254 characters
- Checks for valid format and domain structure

#### Password Validation
```typescript
validatePassword(password: string): { valid: boolean; error?: string; strength?: string }
```
- Minimum 8 characters, maximum 128 characters
- Requires combination of uppercase, lowercase, numbers, and special characters
- Returns password strength: 'weak', 'medium', 'strong', 'very-strong'

#### Phone Validation
```typescript
validatePhone(phone: string): { valid: boolean; error?: string }
```
- Supports Myanmar phone format (+959, 09)
- Length: 7-15 digits
- Handles common separators (spaces, hyphens, parentheses)

#### Name Validation
```typescript
validateName(name: string, fieldName?: string): { valid: boolean; error?: string }
```
- Minimum 2 characters, maximum 100 characters
- Supports letters, spaces, hyphens, apostrophes
- Supports Myanmar (Burmese) Unicode characters

#### Address Validation
```typescript
validateAddress(address: string): { valid: boolean; error?: string }
```
- Minimum 5 characters, maximum 250 characters
- Validates basic address format

#### URL Validation
```typescript
validateUrl(url: string): { valid: boolean; error?: string }
```
- Uses native URL constructor for validation
- Ensures valid URI format

#### Number Validation
```typescript
validateNumber(value: any, options?: { min?: number; max?: number; fieldName?: string }): { valid: boolean; error?: string }
```
- Type coercion from string to number
- Optional min/max range validation

#### Coordinates Validation
```typescript
validateCoordinates(lat: number, lng: number): { valid: boolean; error?: string }
```
- Latitude: -90 to 90
- Longitude: -180 to 180
- Validates against NaN values

#### File Validation
```typescript
validateFile(file: any, options?: { maxSize?: number; mimeTypes?: string[] }): { valid: boolean; error?: string }
```
- File size validation (default 10MB max)
- MIME type checking

#### Password Match Validation
```typescript
validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; error?: string }
```
- Ensures both passwords match exactly

#### Text Length Validation
```typescript
validateLength(text: string, options?: { min?: number; max?: number; fieldName?: string }): { valid: boolean; error?: string }
```
- Flexible min/max length validation

#### Enum Validation
```typescript
validateEnum<T>(value: any, validValues: readonly T[], options?: { fieldName?: string }): { valid: boolean; error?: string }
```
- Validates value is one of allowed options

### 2. Form Validation Hook (`src/hooks/use-form-validation.ts`)

Provides React hooks for form-level validation and state management:

```typescript
const {
  errors,           // Current field errors
  touched,          // Tracks which fields have been touched
  isSubmitting,     // Loading state during submission
  validateField,    // Validate single field
  validateAll,      // Validate all fields at once
  handleBlur,       // Blur event handler with validation
  handleChange,     // Change event handler with conditional validation
  clearErrors,      // Clear all errors
  getFieldState,    // Get error and touch state for a field
  isFormValid       // Check if entire form is valid
} = useFormValidation(config)
```

### 3. API Validation (`src/lib/api-validation.ts`)

Server-side validation helpers and middleware:

- `validateRequestBody<T>()` - Generic request body validation
- `sendValidationError()` - Standardized error response
- `safeParseJSON()` - Safe JSON parsing with error handling
- `validateRequiredFields()` - Check required fields
- `withValidation()` - Wrapper for error handling

## Implemented Validations

### Login Page (`src/app/login/page.tsx`)
- Email format validation with real-time feedback
- Password presence validation
- Form submission disabled until valid
- Field-level error display with icons

### Registration Page (`src/app/register/page.tsx`)
- Name validation (2-100 characters)
- Email validation with format checking
- Phone validation with Myanmar format support
- Password strength validation (8+ chars, mixed case, numbers, symbols)
- Password match validation
- Organization address validation (for org accounts)
- Terms and conditions validation
- Real-time error feedback for each field
- Submit button disabled until all fields valid

### Organization Management (`src/app/organization/page.tsx`)
- Volunteer registration with strict validation:
  - Name (2-100 chars)
  - Email format
  - Phone format
  - Role enum validation
- Supply management with validation:
  - Supply name (1-100 chars)
  - Quantity (non-negative number)
  - Unit (1-50 chars)
  - Category (enum: medical, food, water, shelter, equipment, other)
- Toast notifications for validation errors

### Admin Dashboard (`src/app/admin/page.tsx`)
- Organization creation/update validation
- User management validation
- Form validation before database operations

## Validation Flow

### Client-Side Flow
```
User Input → onChange Handler (clear previous error if touched)
    ↓
onBlur Event → Field Validation
    ↓
Display Error (if invalid) or Clear Error (if valid)
    ↓
Form Submit → Validate All Fields
    ↓
No Errors → Submit to Server
    ↓
Errors → Display to User & Prevent Submit
```

### Server-Side Flow
```
API Request → Parse JSON
    ↓
Validate Request Body
    ↓
Invalid → Return 400 with Error Details
    ↓
Valid → Process Request
    ↓
Database Operation
    ↓
Return Result with 200/Success
```

## Usage Examples

### Using Validation Functions
```typescript
import { validateEmail, validatePassword } from '@/lib/validation'

// Single validation
const emailResult = validateEmail('user@example.com')
if (!emailResult.valid) {
  console.error(emailResult.error)
}

// Password with strength
const passwordResult = validatePassword('SecurePass123!')
console.log(passwordResult.strength) // 'strong' or 'very-strong'
```

### Using Form Validation Hook
```typescript
import { useFormValidation, ValidationConfig } from '@/hooks/use-form-validation'
import { validateEmail, validatePassword } from '@/lib/validation'

const validationConfig: ValidationConfig = {
  email: {
    validate: (value) => validateEmail(value),
    validateOn: 'blur'
  },
  password: {
    validate: (value) => validatePassword(value),
    validateOn: 'change'
  }
}

const { 
  errors, 
  handleBlur, 
  handleChange, 
  validateAll 
} = useFormValidation(validationConfig)
```

### Using API Validation
```typescript
import { 
  safeParseJSON, 
  ApiValidationSchemas,
  sendValidationError,
  sendSuccessResponse,
  validateRequestBody
} from '@/lib/api-validation'

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJSON(req)
    
    const result = ApiValidationSchemas.userRegistration(body)
    if (!result.valid) {
      return sendValidationError(result.errors)
    }
    
    // Process valid request
    return sendSuccessResponse({ user })
  } catch (error) {
    return sendErrorResponse('Invalid request', 400)
  }
}
```

## Validation Schemas

Pre-built validation schemas for common operations:

### ValidationSchemas (Client-Side)
```typescript
ValidationSchemas.userRegistration
ValidationSchemas.organizationRegistration
ValidationSchemas.volunteer
ValidationSchemas.supply
ValidationSchemas.helpRequest
ValidationSchemas.pin
```

### ApiValidationSchemas (Server-Side)
```typescript
ApiValidationSchemas.userRegistration
ApiValidationSchemas.organizationRegistration
ApiValidationSchemas.volunteerCreation
ApiValidationSchemas.pinCreation
ApiValidationSchemas.supplyCreation
ApiValidationSchemas.reverseGeocode
```

## Error Handling

### Client-Side Error Display
- Individual field error messages
- Red border highlighting on invalid fields
- Error icons with descriptive messages
- Form submission disabled until all errors resolved

### Server-Side Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## Sanitization

The validation system includes basic XSS prevention through input sanitization:

```typescript
sanitizeInput(input: string): string
// Escapes HTML entities: & < > " '
```

## Future Enhancements

1. **Custom Validation Rules** - Support for user-defined validation functions
2. **Async Validation** - Server-side validation for unique fields (email, username)
3. **Field Dependencies** - Conditional validation based on other fields
4. **Internationalization** - Localized error messages
5. **Advanced Sanitization** - DOMPurify integration for HTML input
6. **Rate Limiting** - API validation with rate limiting
7. **CSRF Protection** - Token-based CSRF validation

## Best Practices

1. **Always validate on both client and server** - Never trust client-side validation alone
2. **Use appropriate validation functions** - Select validators matching data type
3. **Provide clear error messages** - Help users understand what went wrong
4. **Validate early** - Show errors on blur/change, not just on submit
5. **Handle edge cases** - Empty strings, null, undefined, etc.
6. **Sanitize before storage** - Prevent XSS and injection attacks
7. **Log validation errors** - Track common validation issues for improvements
8. **Test validation thoroughly** - Include edge cases in test suites

## Migration Guide

To add strict validation to existing forms:

1. **Import validation functions**
   ```typescript
   import { validateEmail, validatePhone } from '@/lib/validation'
   ```

2. **Add field error state**
   ```typescript
   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
   ```

3. **Add blur handler**
   ```typescript
   const handleBlur = (e) => {
     const { name, value } = e.target
     const result = validateEmail(value)
     // Update errors state
   }
   ```

4. **Display errors in UI**
   ```tsx
   {fieldErrors.email && (
     <div className="text-red-500 text-sm">{fieldErrors.email}</div>
   )}
   ```

5. **Validate on submit**
   ```typescript
   const handleSubmit = (e) => {
     e.preventDefault()
     // Run all validations
     // Show errors or submit
   }
   ```
