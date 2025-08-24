"use client"
import { useContext, useState, useEffect, createContext } from "react"
import jwt_decode from 'jwt-decode'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loginType, setLoginType] = useState(0) // 0 = logged out by default
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const localToken = localStorage.getItem("token")
        const localLoginType = localStorage.getItem("loginType")

        if (localToken) {
          setToken(localToken)
          setLoginType(Number(localLoginType) || 0)
          const decodedToken = jwt_decode(localToken)
          setUser(decodedToken)
        } else {
          setUser(null)
          setToken(null)
          setLoginType(0) // logged out
        }
      } catch (error) {
        console.error("Failed to fetch auth:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuth()
  }, [])

  const login = (userData, tokenValue, type) => {
    console.log("Yser data: ", userData)
    setUser(userData)
    setToken(tokenValue)
    setLoginType(type)

    localStorage.setItem("token", tokenValue)
    localStorage.setItem("loginType", type)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setLoginType(0)

    localStorage.removeItem("token")
    localStorage.removeItem("loginType")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginType, // 0,1,2,3
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// 🔹 Helper hooks for roles
export const useIsUser = () => {
  const { loginType } = useAuth()
  return loginType === 1
}

export const useIsStorefront = () => {
  const { loginType } = useAuth()
  return loginType === 2
}

export const useIsAdmin = () => {
  const { loginType } = useAuth()
  return loginType === 3
}

export const useIsLoggedIn = () => {
    const { token, loginType, loading } = useAuth()
  
    return {
      isLoggedIn: !!token,
      loading,
    }
  }

  // 🔹 General helper hook
export const useLoginStatus = () => {
    const { loginType, loading } = useAuth()
  
    let status = "loggedOut"
    if (loginType === 1) status = "user"
    else if (loginType === 2) status = "storefront"
    else if (loginType === 3) status = "admin"
  
    return {
      status,    // "loggedOut" | "user" | "storefront" | "admin"
      loginType, // raw number: 0,1,2,3
      loading,
    }
  }
  