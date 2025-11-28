import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../services/supabase'
import { User } from '../types'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { mapSupabaseUser } from './authHelpers'

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  registerWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Helper to fetch profile role and merge with user
  const fetchProfileAndSetUser = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', supabaseUser.id)
        .single()

      const mappedUser = mapSupabaseUser(supabaseUser)

      if (mappedUser) {
        if (profile && !error) {
          mappedUser.role = profile.role as User['role']
          if (!mappedUser.user_metadata) mappedUser.user_metadata = {}
          if (profile.name) mappedUser.user_metadata.full_name = profile.name
          if (profile.avatar_url) mappedUser.user_metadata.avatar_url = profile.avatar_url
        }
        setUser(mappedUser)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setUser(mapSupabaseUser(supabaseUser))
    }
  }

  // Use upsert to create or update profile
  const createUserProfile = async (user: SupabaseUser): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
      if (error) console.warn('Error upserting profile:', error)
    } catch (error) {
      console.warn('Exception in createUserProfile:', error)
    }
  }

  useEffect(() => {
    // Get initial session with timeout
    const initSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session init timeout')), 5000)
        )

        const sessionPromise = supabase.auth.getSession()

        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as { data: { session: any } }

        const session = result.data?.session

        if (session?.user) {
          await fetchProfileAndSetUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.warn('Auth initialization warning:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          await createUserProfile(session.user)
          await fetchProfileAndSetUser(session.user)
        } else if (event === 'TOKEN_REFRESHED') {
          await fetchProfileAndSetUser(session.user)
        } else {
          setUser(mapSupabaseUser(session.user))
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchProfileAndSetUser(session.user)
    }
  }

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { access_type: 'offline', prompt: 'consent' },
          redirectTo: `${redirectUrl}/auth/google-callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google auth error:', error)
      throw error
    }
  }

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await createUserProfile(data.user)
        await fetchProfileAndSetUser(data.user)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' }
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) await fetchProfileAndSetUser(data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timed out')), 3000))
      await Promise.race([supabase.auth.signOut(), timeoutPromise])
    } catch (error) {
      console.error('Logout warning:', error)
    } finally {
      setUser(null)
      try {
        const supabaseKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
        localStorage.removeItem(supabaseKey)
      } catch (e) { console.warn('Could not clear local storage key', e) }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}