
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function verifyMigration() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const testEmail = 'test@example.com';
        let user = await User.findOne({ email: testEmail });

        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                username: 'testuser',
                email: testEmail,
                fullName: 'Test User',
                password: 'hashedpassword',
                phoneNumber: '1234567890',
                currentStatus: 'Student'
            });
        }

        const userId = user._id;
        console.log('User ID:', userId);

        const db = mongoose.connection.db;
        const legacyCollection = db.collection('certificates');

        // Inject a mock legacy certificate
        const mockCert = {
            userId: userId,
            title: 'Legacy Python Cert ' + Date.now(),
            issuer: 'Old Academy',
            issueDate: new Date('2023-01-01'),
            skills: ['Python', 'Data Science'],
            fileUrl: 'http://legacy.url/cert.pdf',
            verificationStatus: 'Verified'
        };

        console.log('Injecting mock legacy certificate...');
        await legacyCollection.insertOne(mockCert);

        // Simulate the migration logic (normally triggered by GET /api/profile)
        console.log('Running migration logic...');
        const legacyCerts = await legacyCollection.find({ userId: userId }).toArray();
        console.log(`Found ${legacyCerts.length} legacy certs.`);

        let migrationPerformed = false;
        legacyCerts.forEach(legacy => {
            const exists = user.certifications.some(c => c.title === legacy.title && c.issuer === legacy.issuer);
            if (!exists) {
                user.certifications.push({
                    title: legacy.title,
                    issuer: legacy.issuer,
                    issueYear: legacy.issueYear || new Date(legacy.issueDate).getFullYear(),
                    issueDate: legacy.issueDate,
                    verificationStatus: legacy.verificationStatus || 'Verified',
                    skills: legacy.skills,
                    fileUrl: legacy.fileUrl,
                    verificationMethod: 'legacy',
                    useInResume: true,
                    uploadedAt: new Date()
                });
                migrationPerformed = true;
            }
        });

        if (migrationPerformed) {
            await user.save();
            console.log('Migration successful: Certs added to User model.');
        } else {
            console.log('Migration skipped: Certs already exist.');
        }

        // Verify final state
        const updatedUser = await User.findById(userId);
        console.log('Total certifications in User model:', updatedUser.certifications.length);
        const lastCert = updatedUser.certifications[updatedUser.certifications.length - 1];
        console.log('Last cert title:', lastCert.title);

        if (lastCert.title === mockCert.title) {
            console.log('SUCCESS: Legacy certificate merged successfully.');
        } else {
            console.log('FAILURE: Legacy certificate not found in User model.');
        }

    } catch (err) {
        console.error('Migration test failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

verifyMigration();
