/**
 * Form validation hook for consistent validation across all forms
 * Provides centralized error management and validation state
 */

import { useState, useCallback } from 'react'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationConfig {
  [fieldName: string]: {
    validate: (value: any) => { valid: boolean; error?: string }
    validateOn?: 'change' | 'blur' | 'submit'
  }
}

export function useFormValidation(config: ValidationConfig) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate single field
  const validateField = useCallback((fieldName: string, value: any) => {
    if (!config[fieldName]) {
      return { valid: true }
    }

    const result = config[fieldName].validate(value)
    
    if (!result.valid) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.error || 'Invalid value'
      }))
      return { valid: false, error: result.error }
    }

    // Clear error if valid
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })

    return { valid: true }
  }, [config])

  // Validate all fields
  const validateAll = useCallback((values: Record<string, any>) => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.entries(config).forEach(([fieldName, fieldConfig]) => {
      const value = values[fieldName]
      const result = fieldConfig.validate(value)

      if (!result.valid) {
        newErrors[fieldName] = result.error || 'Invalid value'
        isValid = false
      }
    })

    setErrors(newErrors)
    return { valid: isValid, errors: newErrors }
  }, [config])

  // Handle blur event
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }, [validateField])

  // Handle change event
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (touched[name]) {
      validateField(name, value)
    }
  }, [validateField, touched])

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  // Mark field as touched
  const markTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
  }, [])

  // Get field validation state
  const getFieldState = useCallback((fieldName: string) => {
    return {
      error: errors[fieldName],
      isTouched: touched[fieldName],
      hasError: !!errors[fieldName] && touched[fieldName]
    }
  }, [errors, touched])

  // Get all field validation state
  const getAllFieldStates = useCallback(() => {
    const states: Record<string, { error?: string; isTouched: boolean; hasError: boolean }> = {}
    
    Object.keys(config).forEach(fieldName => {
      states[fieldName] = getFieldState(fieldName)
    })

    return states
  }, [config, getFieldState])

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  return {
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    validateField,
    validateAll,
    handleBlur,
    handleChange,
    clearErrors,
    markTouched,
    getFieldState,
    getAllFieldStates,
    isFormValid
  }
}

/**
 * Hook for form submission with validation
 * Handles validation and submission in one place
 */
export function useFormSubmit(
  config: ValidationConfig,
  onSubmit: (values: Record<string, any>) => Promise<{ success: boolean; error?: string }>
) {
  const validation = useFormValidation(config)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Get form data
      const formData = new FormData(e.currentTarget)
      const values: Record<string, any> = {}

      formData.forEach((value, key) => {
        values[key] = value
      })

      // Validate all fields
      const validationResult = validation.validateAll(values)

      if (!validationResult.valid) {
        return { success: false, errors: validationResult.errors }
      }

      // Submit form
      validation.setIsSubmitting(true)
      try {
        const result = await onSubmit(values)
        
        if (!result.success && result.error) {
          // Set form-level error
          return { success: false, error: result.error }
        }

        // Clear form on success
        validation.clearErrors()
        return { success: true }
      } finally {
        validation.setIsSubmitting(false)
      }
    },
    [validation]
  )

  return {
    ...validation,
    handleSubmit
  }
}
