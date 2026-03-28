import app from './app.js'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 5000

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`MongoDB connected: ${mongoose.connection.host}`))
  .catch(err => console.log('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
