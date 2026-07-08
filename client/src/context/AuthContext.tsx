
import  { createContext, useContext, useState, type ReactNode } from 'react'
import { login as loginService, signup as signupService, requestPasswordReset as resetPasswordService } from '../services/authService'

type User = {
  id: string
  email: string
  name?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const data = await loginService({ email, password })
    setUser(data.user)
  }

  const signup = async (email: string, password: string, name?: string) => {
    const data = await signupService({ email, password, name })
    setUser(data.user)
  }

  const resetPassword = async (email: string) => {
    await resetPasswordService(email)
    console.log('Password reset request sent')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext