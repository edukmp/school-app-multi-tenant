
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple .env parser
const parseEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env')
        console.log('📂 Looking for .env at:', envPath)
        if (!fs.existsSync(envPath)) {
            console.warn('.env file not found at', envPath)
            return {}
        }
        const envContent = fs.readFileSync(envPath, 'utf-8')
        console.log('📄 .env content length:', envContent.length)
        const env: Record<string, string> = {}
        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim()
            if (!trimmedLine || trimmedLine.startsWith('#')) return

            const match = trimmedLine.match(/^([^=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                const value = match[2].trim().replace(/^["']|["']$/g, '') // remove quotes
                env[key] = value
            } else {
                console.log('⚠️ Could not parse line:', trimmedLine.substring(0, 15) + '...')
            }
        })
        console.log('🔑 Keys found:', Object.keys(env))
        return env
    } catch (e) {
        console.error('Error reading .env:', e)
        return {}
    }
}

const env = parseEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTenantsTable() {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('count')
            .limit(1)

        if (error) {
            if (error.code === '42P01') {
                console.log('RESULT: TABLE_MISSING')
            } else {
                console.log('RESULT: DB_ERROR', error.message)
            }
        } else {
            console.log('RESULT: SUCCESS_TABLE_EXISTS')
        }

    } catch (e: any) {
        console.log('RESULT: UNEXPECTED_ERROR', e.message)
    }
}

checkTenantsTable()
