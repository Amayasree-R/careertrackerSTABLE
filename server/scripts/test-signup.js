import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

async function testSignup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        const testPayload = {
            fullName: 'Test User ' + Date.now(),
            username: 'testuser' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            phoneNumber: '1234567890',
            password: 'password123',
            personalDetails: {
                dob: null,
                gender: 'Male',
                nationality: 'Test',
                location: {
                    city: 'TestCity',
                    state: 'TestState',
                    country: 'TestCountry'
                }
            },
            currentStatus: 'Student',
            education: [{
                degree: 'B.Tech',
                specialization: 'CS',
                college: 'Test College',
                startYear: '2020',
                endYear: '2024'
            }],
            experience: [],
            socialLinks: {
                github: '',
                linkedin: '',
                portfolio: ''
            }
        }

        const user = new User(testPayload)
        await user.save()
        console.log('User saved successfully!', user._id)

        // Clean up
        await User.findByIdAndDelete(user._id)
        console.log('Test user cleaned up')

    } catch (error) {
        console.error('Signup Failure:', error)
    } finally {
        await mongoose.disconnect()
    }
}

testSignup()
