import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { Tenant } from '../types'
import { supabase } from '../services/supabase'
import { generateThemePalette, applyThemePalette } from '../utils/colorTheming'

interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  error: string | null
  setTenant: (tenant: Tenant) => void
  refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track tenant state and avoid stale closures in useCallback
  const tenantRef = useRef<Tenant | null>(null)

  useEffect(() => {
    tenantRef.current = tenant
  }, [tenant])

  const applyTenantTheme = (tenant: Tenant): void => {
    if (tenant.theme_config) {
      const primaryColor = tenant.theme_config.primaryColor || tenant.theme_config.primary_color
      const secondaryColor = tenant.theme_config.secondaryColor || tenant.theme_config.secondary_color

      if (primaryColor && secondaryColor) {
        console.log('🎨 Generating theme palette from:', { primaryColor, secondaryColor })

        // Generate comprehensive color palette
        const palette = generateThemePalette(primaryColor, secondaryColor)

        // Apply to CSS variables (including logo)
        applyThemePalette(palette, tenant.theme_config.logo)

        console.log('✅ Theme palette applied:', palette)
      } else {
        console.warn('⚠️ Missing primary or secondary color in theme config')
      }
    }
  }

  const fetchTenantFromSupabase = async (userId: string): Promise<Tenant | null> => {
    try {
      // 1. Get tenant_id from user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userId)
        .single()

      if (profileError) {
        // It's possible the profile doesn't exist yet or doesn't have tenant_id
        console.warn('Could not fetch profile for tenant detection:', profileError.message)
        return null
      }

      if (!profile?.tenant_id) {
        return null
      }

      // 2. Fetch tenant details
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single()

      if (tenantError) {
        throw tenantError
      }

      if (tenantData) {
        return {
          id: tenantData.id,
          name: tenantData.name,
          subdomain: tenantData.subdomain,
          theme_config: tenantData.theme_config || {},
          active_modules: tenantData.active_modules || []
        }
      }
    } catch (err) {
      console.error('Error fetching tenant from Supabase:', err)
      return null
    }
    return null
  }

  const detectTenant = useCallback(async (): Promise<void> => {
    // Only show loading if we don't have a tenant yet (Stale-while-revalidate)
    if (!tenantRef.current) {
      setLoading(true)
    }
    setError(null)

    try {
      let foundTenant: Tenant | null = null

      // Strategy 1: Check authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        foundTenant = await fetchTenantFromSupabase(session.user.id)
      }

      // Strategy 2: Check localStorage (Onboarding/Dev Config)
      if (!foundTenant) {
        const savedTenant = localStorage.getItem('tenant_config')
        if (savedTenant) {
          try {
            foundTenant = JSON.parse(savedTenant)
          } catch (e) {
            console.error('Failed to parse (tenant_config) from localStorage', e)
          }
        }
      }

      // Strategy 3: Mock/Demo Fallback (if no other tenant found)
      // Only verify against checking a 'public' landing page or similar in future
      if (!foundTenant) {
        const mockTenant: Tenant = {
          id: 'demo',
          name: 'Sekolah Demo',
          subdomain: 'demo',
          theme_config: {
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
          },
          active_modules: ['academic', 'payment', 'meeting']
        }
        foundTenant = mockTenant
      }

      if (foundTenant) {
        setTenant(foundTenant)
        applyTenantTheme(foundTenant)
      }

    } catch (error: any) {
      console.error('Tenant detection check failed:', error)
      setError(error.message || 'Failed to detect tenant')

      // Fallback tenant to prevent crash
      const fallbackTenant: Tenant = {
        id: 'default',
        name: 'Default School',
        subdomain: 'default',
        theme_config: {},
        active_modules: []
      }
      setTenant(fallbackTenant)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial detection
  useEffect(() => {
    void detectTenant()

    // Listed for auth changes to re-detect tenant
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        void detectTenant()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [detectTenant])

  const value: TenantContextType = {
    tenant,
    loading,
    error,
    setTenant: (newTenant) => {
      setTenant(newTenant)
      applyTenantTheme(newTenant)
    },
    refreshTenant: detectTenant
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}