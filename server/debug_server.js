import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import quizRoutes from './routes/quiz.js'

const app = express()
const PORT = 5001 // Debug port

app.use(cors())
app.use(express.json())

app.use('/api/quiz', quizRoutes)

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Debug Server MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err))

app.listen(PORT, () => {
    console.log(`Debug Server running on port ${PORT}`)
    import('fs').then(fs => {
        fs.writeFileSync('debug_start_log.txt', `Server started on port ${PORT} at ${new Date().toISOString()}`)
    })
})
