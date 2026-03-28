import dotenv from 'dotenv'
dotenv.config()
import resumeRoutes from './routes/resume.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import roadmapRoutes from './routes/roadmap.js'
import skillDetailRoutes from './routes/skillDetail.js'
import quizRoutes from './routes/quiz.js'
import certificateRoutes from './routes/certificate.js'
import projectRoutes from './routes/projects.js'
import jobRoutes from './routes/jobs.js'
import visualRoadmapRoutes from './routes/visualRoadmap.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use('/certificates', express.static(path.join(__dirname, '../uploads/certificates')))

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Career Path Tracker API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api', skillDetailRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/cert', certificateRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/visual-roadmap', visualRoadmapRoutes)

export default app
