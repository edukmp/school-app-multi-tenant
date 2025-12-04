import React, { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PWAInstallButton: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showButton, setShowButton] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            console.log('👍 beforeinstallprompt event fired')

            // Stash the event so it can be triggered later
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowButton(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('✅ App is already installed')
            setShowButton(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.log('❌ No install prompt available')
            return
        }

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`👤 User response: ${outcome}`)

        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt')
        } else {
            console.log('❌ User dismissed the install prompt')
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null)
        setShowButton(false)
    }

    if (!showButton) {
        return null
    }

    return (
        <button
            onClick={handleInstallClick}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 9999,
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install App
        </button>
    )
}

export default PWAInstallButton
