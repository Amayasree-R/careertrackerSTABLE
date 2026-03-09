#!/usr/bin/env node

/**
 * Groq API Key Verification Utility
 * Run this script to verify your API key configuration
 * 
 * Usage: node verify_api_key.js
 */

import dotenv from 'dotenv'
import Groq from 'groq-sdk'

console.log('\n' + '='.repeat(60))
console.log('  Groq API Key Verification Utility')
console.log('='.repeat(60) + '\n')

// Step 1: Load .env file
console.log('Step 1: Loading .env file...')
const envResult = dotenv.config({ path: '.env' })

if (envResult.error) {
  console.log('  ⚠️  No .env file found in current directory')
  console.log('  Create a .env file with: GROQ_API_KEY=your_key_here')
} else {
  console.log('  ✓ .env file loaded successfully')
}

// Step 2: Check if API key exists
console.log('\nStep 2: Checking GROQ_API_KEY environment variable...')
const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  console.log('  ❌ GROQ_API_KEY not found')
  console.log('  Please set GROQ_API_KEY in .env file')
  process.exit(1)
}

console.log('  ✓ GROQ_API_KEY found')
console.log(`  Preview: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`)

// Step 3: Validate key format
console.log('\nStep 3: Validating API key format...')

if (!apiKey.startsWith('gsk_')) {
  console.log('  ⚠️  WARNING: API key does not start with "gsk_"')
  console.log('  Expected format: gsk_xxxxxxxxxxxxxxxxxxxx...')
  console.log('  Double-check your key from console.groq.com')
}

if (apiKey.length < 30) {
  console.log('  ❌ ERROR: API key appears to be too short')
  console.log('  Groq API keys are typically 50+ characters')
  process.exit(1)
}

console.log('  ✓ API key format looks valid')

// Step 4: Try to initialize Groq client
console.log('\nStep 4: Initializing Groq client...')

try {
  const groq = new Groq({ apiKey })
  console.log('  ✓ Groq client initialized successfully')
} catch (error) {
  console.log('  ❌ Failed to initialize Groq client')
  console.log(`  Error: ${error.message}`)
  process.exit(1)
}

// Step 5: Test API connection (optional)
console.log('\nStep 5: Testing Groq API connection...')
console.log('  (This will make a real API call - uses minimal tokens)')

try {
  const groq = new Groq({ apiKey })
  
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Say "API connection successful" in exactly those words.',
      },
    ],
    model: 'llama-3.1-8b-instant',
    max_tokens: 50,
  })

  const responseText = response.choices[0].message.content

  if (responseText.includes('API connection successful')) {
    console.log('  ✓ API connection successful!')
    console.log(`  Response: "${responseText.trim()}"`)
  } else {
    console.log('  ⚠️  API responded but unexpected message:')
    console.log(`  Response: "${responseText.trim()}"`)
  }
} catch (error) {
  if (error.status === 401) {
    console.log('  ❌ API Authentication Failed')
    console.log('  Your API key is invalid or expired')
    console.log('  Please verify it at: https://console.groq.com/keys')
    console.log(`  Error: ${error.message}`)
    process.exit(1)
  } else if (error.status === 429) {
    console.log('  ⚠️  API Rate Limited (expected in development)')
    console.log('  Your API key is valid but you hit the request limit')
    console.log('  Wait a moment and try again')
  } else {
    console.log(`  ❌ API Error: ${error.message}`)
    console.log(`  Status: ${error.status}`)
    process.exit(1)
  }
}

// Final summary
console.log('\n' + '='.repeat(60))
console.log('  ✓ Configuration Verification Complete!')
console.log('='.repeat(60))

console.log(`\nYour configuration:`)
console.log(`  • API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)} (valid format)`)
console.log(`  • Environment: ${process.env.NODE_ENV || 'development'}`)
console.log(`  • Status: Ready for certificate uploads`)

console.log('\nNext steps:')
console.log('  1. Restart your backend server: npm run dev')
console.log('  2. Try uploading a certificate')
console.log('  3. Check the server console for success message')

console.log('\nFor more information, see: FIX_API_KEY_ERROR.md\n')

process.exit(0)
