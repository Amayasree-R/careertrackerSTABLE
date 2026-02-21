import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import fs from 'fs'

const router = express.Router()

/* =========================
   SIGNUP ROUTE
   ========================= */
router.post('/signup', async (req, res) => {
  try {
    const logData = `[${new Date().toISOString()}] Signup request: ${JSON.stringify(req.body)}\n`;
    fs.appendFileSync('signup_debug.log', logData);
    console.log('Signup request body:', req.body) // 🔍 debug

    const {
      username,
      email,
      fullName,
      phoneNumber,
      password,
      personalDetails,
      currentStatus,
      education,
      experience,
      socialLinks
    } = req.body

    // 1. Validate input
    if (!username || !email || !fullName || !phoneNumber || !password || !currentStatus) {
      return res.status(400).json({ message: 'All basic fields and Current Status are required' })
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })
    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email'
      return res.status(400).json({ message: `${field} already exists` })
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create and save user
    const user = new User({
      username,
      email,
      fullName,
      phoneNumber,
      password: hashedPassword,
      personalDetails,
      currentStatus,
      education,
      experience,
      socialLinks
    })

    console.log('Attempting to save user:', user.email)
    await user.save()
    console.log('User saved successfully:', user._id)

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 6. Success response
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    })

  } catch (error) {
    const errorData = `[${new Date().toISOString()}] Signup ERROR: ${error.message}\n${error.stack}\n`;
    fs.appendFileSync('signup_debug.log', errorData);
    console.error('Signup error:', error) // 🔴 important
    res.status(500).json({ message: 'Internal server error: ' + error.message })
  }
})

/* =========================
   LOGIN ROUTE
   ========================= */
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body) // 🔍 debug

    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // 1. Find user
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // 3. Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
