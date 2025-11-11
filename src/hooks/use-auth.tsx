'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'tracking_volunteer' | 'supply_volunteer' | 'organization' | 'admin'
  organizationId?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: 'user' | 'tracking_volunteer' | 'supply_volunteer'
  organizationId?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    image: '/avatars/admin.jpg'
  },
  {
    id: '2',
    name: 'Organization A',
    email: 'orgA',
    password: 'org123',
    role: 'organization' as const,
    image: '/avatars/org.jpg'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved session on mount
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check mock users first
      const mockUser = mockUsers.find(u => u.email === email && u.password === password)
      if (mockUser) {
        const { password: _, ...userWithoutPassword } = mockUser
        setUser(userWithoutPassword)
        localStorage.setItem('user', JSON.stringify(userWithoutPassword))
        return { success: true }
      }
      
      // For demo purposes, create a test user if credentials don't match mock users
      if (email && password) {
        const testUser: User = {
          id: 'test-' + Date.now(),
          name: email.split('@')[0],
          email: email,
          phone: '+95123456789',
          role: 'user',
          image: '/avatars/user.jpg'
        }
        setUser(testUser)
        localStorage.setItem('user', JSON.stringify(testUser))
        return { success: true }
      }
      
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, always succeed
      const newUser: User = {
        id: 'user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        organizationId: userData.organizationId,
        image: '/avatars/user.jpg'
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}