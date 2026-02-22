import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';
const TEST_USER = {
    username: `dbtest_${Date.now()}`,
    email: `dbtest_${Date.now()}@example.com`,
    fullName: 'DB Verifier',
    phoneNumber: '9998887776',
    password: 'Password123!',
    currentStatus: 'Working Professional'
};

const sampleCertPath = 'c:/careertrackerSTABLE/server/node_modules/pdf2pic/examples/docker/example.pdf';

async function verify() {
    try {
        console.log('1. Registering test user...');
        const signupRes = await axios.post(`${API_BASE}/auth/signup`, TEST_USER);
        const token = signupRes.data.token;
        const userId = signupRes.data.user.id;
        console.log(`✓ Registered user: ${userId}`);

        // Mock a roadmap for the user
        console.log('2. Mocking user roadmap...');
        // We update the user profile directly via a mock if we had a route, 
        // but here we'll just rely on the fact that missingSkills is empty if not set.
        // Let's manually set a roadmap for the user in the DB if we could, 
        // but the verification script runs externally. 
        // So we'll check if the certificate saves correctly even with empty roadmap first.

        console.log('3. Uploading certificate...');
        const form = new FormData();
        form.append('certificate', fs.createReadStream(sampleCertPath));

        const uploadRes = await axios.post(`${API_BASE}/certificates/upload`, form, {
            headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` }
        });
        const certId = uploadRes.data.certificate._id;
        console.log(`✓ Certificate saved to DB. ID: ${certId}`);
        console.log(`  Skill: ${uploadRes.data.certificate.skillName}`);

        console.log('4. Fetching all certificates...');
        const getRes = await axios.get(`${API_BASE}/certificates`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✓ Retrieved ${getRes.data.length} certificates.`);

        console.log('5. Toggling includeInResume...');
        const toggleRes = await axios.patch(`${API_BASE}/certificates/${certId}/toggle-resume`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✓ Toggled. New status (includeInResume): ${toggleRes.data.includeInResume}`);

        console.log('6. Deleting certificate...');
        const delRes = await axios.delete(`${API_BASE}/certificates/${certId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✓ Deleted successfully. Message: ${delRes.data.message}`);

        console.log('\n✅ COMPREHENSIVE DB VERIFICATION SUCCESSFUL!');

    } catch (error) {
        console.error('\n❌ VERIFICATION ERROR:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

verify();
