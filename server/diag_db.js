import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function listCollections() {
    let output = '';
    try {
        output += 'Connecting to MongoDB...\n';
        await mongoose.connect(process.env.MONGODB_URI);
        output += 'Connected.\n';

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        output += 'Collections in database:\n';
        collections.forEach(c => {
            output += ' - ' + c.name + '\n';
        });

    } catch (err) {
        output += 'Error: ' + err.message + '\n';
    } finally {
        await mongoose.disconnect();
        output += 'Disconnected.\n';
        fs.writeFileSync('diag_out.txt', output);
        console.log('Output written to diag_out.txt');
    }
}

listCollections();
