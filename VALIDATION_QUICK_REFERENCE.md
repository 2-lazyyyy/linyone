# Quick Reference - Strict Validation System

## 🚀 Quick Start

### Import Validation Functions
```typescript
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateAddress,
  validateNumber,
  validateLength,
  validateEnum
} from '@/lib/validation'
```

### Common Validations

#### Email
```typescript
const result = validateEmail('user@example.com')
if (!result.valid) console.error(result.error)
```

#### Password
```typescript
const result = validatePassword('SecurePass123!')
console.log(result.strength) // 'strong' or 'very-strong'
```

#### Phone (Myanmar Format)
```typescript
const result = validatePhone('+959123456789')
```

#### Name
```typescript
const result = validateName('John Doe', 'Full Name')
```

#### Number with Range
```typescript
const result = validateNumber(quantity, { min: 0, max: 1000 })
```

## 📋 Validation Rules

### Email
- Required field
- RFC 5322 compliant
- Max 254 characters
- Format: `user@domain.com`

### Password
- Minimum: 8 characters
- Maximum: 128 characters
- Must contain:
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character (!@#$%^&*)
- Returns strength indicator

### Phone
- Minimum: 7 digits
- Maximum: 15 digits
- Myanmar format: +959XXXXXXXXX or 09XXXXXXXXX
- Allows separators: spaces, hyphens, parentheses

### Name
- Minimum: 2 characters
- Maximum: 100 characters
- Allows: letters, spaces, hyphens, apostrophes
- Supports: Myanmar Unicode characters

### Quantity/Number
- Type: number
- Supports: min/max range validation
- Handles: string to number coercion

### Text Length
- Customizable min/max
- Trims whitespace
- Validates character count

### Address
- Minimum: 5 characters
- Maximum: 250 characters
- General format validation

## 🎯 Form Implementation Pattern

### 1. Add State
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
```

### 2. Create Validator
```typescript
const validateEmailField = (email: string) => {
  const result = validateEmail(email)
  if (!result.valid) {
    setFieldErrors(prev => ({ ...prev, email: result.error || 'Invalid' }))
    return false
  }
  setFieldErrors(prev => {
    const newErrors = { ...prev }
    delete newErrors.email
    return newErrors
  })
  return true
}
```

### 3. Add Event Handlers
```typescript
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  if (name === 'email') validateEmailField(value)
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
  // Clear error on change (optional)
  if (fieldErrors[name]) {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }
}
```

### 4. Display Errors
```tsx
<Input
  name="email"
  onChange={handleChange}
  onBlur={handleBlur}
  className={fieldErrors.email ? 'border-red-500' : ''}
/>
{fieldErrors.email && (
  <div className="flex items-center gap-2 text-red-500 text-sm">
    <AlertCircle className="w-4 h-4" />
    {fieldErrors.email}
  </div>
)}
```

### 5. Form Submit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setFieldErrors({})
  
  // Validate all fields
  let isValid = true
  isValid = validateEmailField(formData.email) && isValid
  isValid = validatePasswordField(formData.password) && isValid
  
  if (!isValid) {
    toast({ title: 'Validation Error', description: 'Fix errors below' })
    return
  }
  
  // Submit form
  const result = await submitForm(formData)
}
```

## 🔐 Pre-built Schemas

### Client-Side
```typescript
ValidationSchemas.userRegistration
ValidationSchemas.organizationRegistration
ValidationSchemas.volunteer
ValidationSchemas.supply
ValidationSchemas.helpRequest
ValidationSchemas.pin
```

### Server-Side
```typescript
ApiValidationSchemas.userRegistration
ApiValidationSchemas.organizationRegistration
ApiValidationSchemas.volunteerCreation
ApiValidationSchemas.pinCreation
ApiValidationSchemas.supplyCreation
ApiValidationSchemas.reverseGeocode
```

## 🖥️ API Validation

### Validate Request Body
```typescript
import { 
  ApiValidationSchemas, 
  sendValidationError,
  sendSuccessResponse,
  safeParseJSON
} from '@/lib/api-validation'

export async function POST(req: NextRequest) {
  try {
    const body = await safeParseJSON(req)
    
    // Validate
    const result = ApiValidationSchemas.userRegistration(body)
    if (!result.valid) {
      return sendValidationError(result.errors)
    }
    
    // Process valid request
    const user = await createUser(body)
    return sendSuccessResponse({ user })
  } catch (error) {
    return sendErrorResponse('Invalid request', 400)
  }
}
```

## 📊 Error Response Format

### Client-Side Toast
```typescript
toast({
  title: "❌ Validation Error",
  description: "Please fix all errors",
  variant: "destructive"
})
```

### Server-Side Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password too short" }
  ]
}
```

## ✅ Implementation Checklist

- [ ] Import validation functions
- [ ] Add error state for fields
- [ ] Create field validators
- [ ] Add blur event handler
- [ ] Add change event handler (optional)
- [ ] Display field errors
- [ ] Disable submit button until valid
- [ ] Validate on submit
- [ ] Add toast notifications
- [ ] Test with valid/invalid inputs
- [ ] Test edge cases
- [ ] Add server-side validation

## 🧪 Test Examples

```typescript
// Valid inputs
validateEmail('user@example.com') // ✅
validatePassword('SecurePass123!') // ✅
validatePhone('+959123456789') // ✅
validateName('John Doe') // ✅

// Invalid inputs
validateEmail('invalid-email') // ❌
validatePassword('weak') // ❌
validatePhone('123') // ❌
validateName('A') // ❌
```

## 🔗 Related Files

- `src/lib/validation.ts` - All validation functions
- `src/lib/api-validation.ts` - API helpers
- `src/hooks/use-form-validation.ts` - Form hook
- `VALIDATION_SYSTEM.md` - Full documentation
- `src/app/login/page.tsx` - Example implementation
- `src/app/register/page.tsx` - Example implementation

## 💡 Tips

1. **Always validate on blur** - Provides immediate feedback
2. **Validate on submit** - Catches edge cases
3. **Sanitize on server** - Never trust client validation alone
4. **Show specific errors** - Generic errors don't help users
5. **Disable submit while invalid** - Prevents bad submissions
6. **Use toast notifications** - Inform users of success/failure
7. **Test edge cases** - Empty strings, spaces, special chars
8. **Log validation errors** - Debug common issues

---

For detailed information, see `VALIDATION_SYSTEM.md`
