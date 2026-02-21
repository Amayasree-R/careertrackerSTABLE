import mongoose from 'mongoose';
import User from '../server/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function getLatestResume() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-tracker');

        // Find the latest user who has resume data
        const user = await User.findOne({ 'resumeData.parsedAt': { $ne: null } })
            .sort({ 'resumeData.parsedAt': -1 });

        if (!user) {
            console.log('No resume data found in database.');
            process.exit(0);
        }

        console.log(JSON.stringify({
            fullName: user.fullName || user.username,
            resumeData: user.resumeData,
            resumeFile: user.resumeFile
        }, null, 2));

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error fetching resume data:', error.message);
        process.exit(1);
    }
}

getLatestResume();
