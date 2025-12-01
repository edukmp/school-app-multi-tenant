import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  // Simplified: Just use metadata, skip profile fetch for now
  const setUserFromSupabase = (supabaseUser: SupabaseUser) => {
    const mappedUser = mapSupabaseUser(supabaseUser)
    if (mappedUser) {
      // Use role from metadata if available
      if (supabaseUser.user_metadata?.role) {
        mappedUser.role = supabaseUser.user_metadata.role as User['role']
      }
      setUser(mappedUser)
    }
  }

  // Background profile fetch (non-blocking)
  const fetchProfileInBackground = async (supabaseUser: SupabaseUser) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const fetchPromise = supabase
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', supabaseUser.id)
        .single()

      const { data: profile, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (profile && !error) {
        // AUTO-FIX: If metadata says admin but DB says user, trust metadata and update DB
        if (supabaseUser.user_metadata?.role === 'admin' && profile.role === 'user') {
          console.warn('⚠️ Role mismatch detected! Metadata says "admin" but DB says "user". Auto-fixing DB...');

          // Fire and forget update
          supabase.from('profiles').update({ role: 'admin' }).eq('id', supabaseUser.id).then(({ error }) => {
            if (error) console.error('❌ Failed to auto-correct role:', error);
          });

          // Force profile role to be admin for this update so we don't downgrade the user locally
          profile.role = 'admin';
        }

        setUser(prev => {
          if (!prev) return prev
          return {
            ...prev,
            role: (profile.role as User['role']) || prev.role,
            user_metadata: {
              ...prev.user_metadata,
              full_name: profile.name || prev.user_metadata?.full_name,
              avatar_url: profile.avatar_url || prev.user_metadata?.avatar_url
            }
          }
        })
      }
    } catch (err) {
      // Silent fail for background fetch
    }
  }

  const createUserProfile = async (user: SupabaseUser): Promise<void> => {
    try {
      const updates: any = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString()
      }

      if (user.user_metadata?.role) {
        updates.role = user.user_metadata.role
      }

      // Fire and forget - don't wait for this
      supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id', ignoreDuplicates: true })
        .then(({ error }) => {
          if (error) console.warn('Profile upsert warning:', error)
        })
    } catch (error) {
      console.warn('Exception in createUserProfile:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        // Emergency timeout
        const emergencyTimeout = setTimeout(() => {
          if (mounted) {
            setLoading(false)
            setUser(null)
          }
        }, 5000)

        const { data: { session } } = await supabase.auth.getSession()

        clearTimeout(emergencyTimeout)

        if (session?.user && mounted) {
          setUserFromSupabase(session.user)
          // Fetch profile in background (non-blocking)
          fetchProfileInBackground(session.user)
        } else {
          if (mounted) setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (session?.user) {
        if (event === 'SIGNED_IN') {
          createUserProfile(session.user) // Fire and forget
          setUserFromSupabase(session.user)
          fetchProfileInBackground(session.user) // Background fetch
        } else if (event === 'TOKEN_REFRESHED') {
          setUserFromSupabase(session.user)
          fetchProfileInBackground(session.user)
        } else {
          setUserFromSupabase(session.user)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchProfileInBackground(session.user)
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
        createUserProfile(data.user)
        setUserFromSupabase(data.user)
        fetchProfileInBackground(data.user)
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

      if (data.user) {
        setUserFromSupabase(data.user)
        fetchProfileInBackground(data.user) // Background fetch
      }

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout warning:', error)
    } finally {
      setUser(null)
      try {
        const supabaseKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
        localStorage.removeItem(supabaseKey)
      } catch (e) { console.warn('Could not clear local storage key', e) }

      // Redirect to landing page
      navigate('/')
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