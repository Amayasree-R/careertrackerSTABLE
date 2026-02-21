import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-tracker';
        await mongoose.connect(uri);

        const users = await User.find({}).limit(5);

        users.forEach(u => {
            console.log(`User: ${u.username}`);
            console.log(`Completed Skills:`, JSON.stringify(u.profile.completedSkills, null, 2));
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

check();
