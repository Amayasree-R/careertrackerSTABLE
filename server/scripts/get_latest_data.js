import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function getLatestResume() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-tracker';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);

        const user = await User.findOne({ 'resumeData.parsedAt': { $ne: null } })
            .sort({ 'resumeData.parsedAt': -1 });

        if (!user) {
            console.log('No resume data found.');
            process.exit(0);
        }

        console.log('=== DATA START ===');
        console.log(JSON.stringify({
            fullName: user.fullName || user.username,
            profile: user.profile,
            resumeData: user.resumeData,
            resumeFile: user.resumeFile
        }, null, 2));
        console.log('=== DATA END ===');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

getLatestResume();
