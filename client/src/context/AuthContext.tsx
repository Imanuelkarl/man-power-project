
import  { createContext, useContext, useState, type ReactNode } from 'react'
import { login as loginService, signup as signupService, resetPassword as resetPasswordService } from '../services/authService'

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
    // implement actual login logic here
    loginService({ email, password }).then((data) => {
      setUser(data.user)
    });

    setUser({ id: '1', email, name: 'User' })
  }

  const signup = async (email: string, password: string, name?: string) => {
    // implement actual signup logic here
    signupService({ email, password, name }).then((data) => {
      setUser(data.user)
    });
    setUser({ id: '2', email, name })
  }

  const resetPassword = async (email: string) => {
    // implement actual reset password logic here
    const token = 'dummy-token'; // In a real application, you would get this token from the server
    resetPasswordService(token, email).then(() => {
      console.log('Password reset request sent')
    });
    return
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