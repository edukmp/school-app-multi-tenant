import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading, refreshProfile } = useAuth()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkUserRole = async () => {
      // Wait for auth loading to complete
      if (loading) return

      if (user) {
        // If role is missing, try to refresh profile (max 3 times)
        if (!user.role && retryCount < 3) {
          console.log(`🔄 Refreshing profile to get role (Attempt ${retryCount + 1})...`)
          await refreshProfile()
          setRetryCount(prev => prev + 1)
          return
        }

        console.log('🔍 GoogleAuthCallback Check:', {
          email: user.email,
          role: user.role,
          id: user.id
        })

        if (user.role === 'super_admin') {
          console.log('✅ Redirecting to Super Admin Dashboard')
          navigate('/super-admin')
        } else {
          console.log('⚠️ Role is not super_admin, redirecting to Home')
          navigate('/')
        }
      } else if (!loading) {
        // Only redirect if we are sure loading is done and no user
        console.log('❌ No user found after loading')
        navigate('/auth/login')
      }
    }

    checkUserRole()
  }, [user, loading, navigate, refreshProfile, retryCount])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Processing Login...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
        {retryCount > 0 && <p className="text-sm text-gray-400 mt-2">Syncing profile data...</p>}
      </div>
    </div>
  )
}

export default GoogleAuthCallback
