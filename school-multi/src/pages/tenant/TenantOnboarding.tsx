import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Server, Palette, CheckCircle, Layout, ArrowRight, ArrowLeft, Loader } from 'lucide-react'
import '../../styles/tenant-setup.scss' // Reuse existing styles

interface OnboardingData {
    // Database
    dbMode: 'simple' | 'advanced'
    dbName: string
    dbHost: string
    dbUser: string
    dbPass: string
    dbString: string

    // Data
    installTables: boolean
    seedExampleData: boolean

    // Branding
    schoolName: string
    primaryColor: string
    secondaryColor: string
    logo: File | null
    modules: string[]
}

const TenantOnboarding: React.FC = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<OnboardingData>({
        dbMode: 'simple',
        dbName: '',
        dbHost: 'localhost',
        dbUser: 'postgres',
        dbPass: '',
        dbString: '',
        installTables: true,
        seedExampleData: false,
        schoolName: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        logo: null,
        modules: ['academic', 'students']
    })

    // Simulation states
    const [installProgress, setInstallProgress] = useState(0)
    const [installStatus, setInstallStatus] = useState('')

    const handleNext = () => setStep(prev => prev + 1)
    const handlePrev = () => setStep(prev => prev - 1)

    const handleFinish = async () => {
        setLoading(true)
        // Simulate saving configuration
        await new Promise(resolve => setTimeout(resolve, 2000))
        setLoading(false)
        navigate('/admin') // Redirect to admin dashboard
    }

    const runInstallation = async () => {
        setLoading(true)
        setInstallStatus('Connecting to database...')
        setInstallProgress(10)
        await new Promise(r => setTimeout(r, 1000))

        setInstallStatus('Creating schemas and tables...')
        setInstallProgress(40)
        await new Promise(r => setTimeout(r, 1500))

        if (data.seedExampleData) {
            setInstallStatus('Seeding example data (Students, Teachers, Classes)...')
            setInstallProgress(70)
            await new Promise(r => setTimeout(r, 1500))
        }

        setInstallStatus('Installation complete!')
        setInstallProgress(100)
        setLoading(false)
    }

    const toggleModule = (mod: string) => {
        setData(prev => ({
            ...prev,
            modules: prev.modules.includes(mod)
                ? prev.modules.filter(m => m !== mod)
                : [...prev.modules, mod]
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white">
                    <h1 className="text-2xl font-bold">School Setup Wizard</h1>
                    <p className="opacity-90">Complete these steps to launch your school platform</p>
                </div>

                {/* Progress Bar */}
                <div className="flex border-b">
                    {[
                        { n: 1, label: 'Database', icon: Database },
                        { n: 2, label: 'Initialization', icon: Server },
                        { n: 3, label: 'Branding', icon: Palette }
                    ].map((s) => (
                        <div key={s.n} className={`flex-1 p-4 flex items-center justify-center gap-2 border-b-2 ${step === s.n ? 'border-blue-600 text-blue-600 bg-blue-50' : step > s.n ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
                            <s.icon size={20} />
                            <span className="font-medium">{s.label}</span>
                            {step > s.n && <CheckCircle size={16} />}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 min-h-[400px]">

                    {/* STEP 1: DATABASE */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800">Database Configuration</h2>
                            <p className="text-gray-600">Configure where your school's data will be stored.</p>

                            <div className="flex gap-4 mb-6">
                                <button
                                    onClick={() => setData({ ...data, dbMode: 'simple' })}
                                    className={`px-4 py-2 rounded-lg border ${data.dbMode === 'simple' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
                                >
                                    Simple Configuration
                                </button>
                                <button
                                    onClick={() => setData({ ...data, dbMode: 'advanced' })}
                                    className={`px-4 py-2 rounded-lg border ${data.dbMode === 'advanced' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200'}`}
                                >
                                    Connection String
                                </button>
                            </div>

                            {data.dbMode === 'simple' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                                        <input type="text" className="w-full border rounded-md p-2" value={data.dbHost} onChange={e => setData({ ...data, dbHost: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
                                        <input type="text" className="w-full border rounded-md p-2" value={data.dbName} onChange={e => setData({ ...data, dbName: e.target.value })} placeholder="school_db" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                        <input type="text" className="w-full border rounded-md p-2" value={data.dbUser} onChange={e => setData({ ...data, dbUser: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input type="password" className="w-full border rounded-md p-2" value={data.dbPass} onChange={e => setData({ ...data, dbPass: e.target.value })} />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PostgreSQL Connection String</label>
                                    <textarea
                                        className="w-full border rounded-md p-2 h-24 font-mono text-sm"
                                        placeholder="postgresql://user:password@host:port/dbname"
                                        value={data.dbString}
                                        onChange={e => setData({ ...data, dbString: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: INITIALIZATION */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800">System Initialization</h2>

                            {!installProgress ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50">
                                        <input
                                            type="checkbox"
                                            id="seed"
                                            className="mt-1"
                                            checked={data.seedExampleData}
                                            onChange={e => setData({ ...data, seedExampleData: e.target.checked })}
                                        />
                                        <div>
                                            <label htmlFor="seed" className="font-medium block">Install Example Data</label>
                                            <p className="text-sm text-gray-500">Populate the database with sample students, teachers, and classes to help you get started.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={runInstallation}
                                        disabled={loading}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : <Server size={20} />}
                                        Start Installation
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 py-8">
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${installProgress}%` }}></div>
                                    </div>
                                    <p className="text-center font-medium text-gray-700">{installStatus}</p>
                                    {installProgress === 100 && (
                                        <div className="text-center text-green-600 flex items-center justify-center gap-2 mt-4">
                                            <CheckCircle /> Database is ready!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: BRANDING */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800">Branding & Modules</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-md p-2"
                                            value={data.schoolName}
                                            onChange={e => setData({ ...data, schoolName: e.target.value })}
                                            placeholder="e.g. Harapan Bangsa School"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={data.primaryColor} onChange={e => setData({ ...data, primaryColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                                                <span className="text-sm text-gray-500">{data.primaryColor}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={data.secondaryColor} onChange={e => setData({ ...data, secondaryColor: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                                                <span className="text-sm text-gray-500">{data.secondaryColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">School Logo</label>
                                        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Active Modules</label>
                                    <div className="space-y-2">
                                        {['Academic', 'Students', 'Teachers', 'Finance', 'Library', 'Transport'].map(mod => (
                                            <label key={mod} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.modules.includes(mod.toLowerCase())}
                                                    onChange={() => toggleModule(mod.toLowerCase())}
                                                />
                                                <span>{mod} Module</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t flex justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={step === 1 || loading}
                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={(step === 2 && installProgress < 100) || loading}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            Next Step <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Launch Dashboard'} <Layout size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TenantOnboarding
