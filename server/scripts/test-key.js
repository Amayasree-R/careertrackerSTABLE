import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey || apiKey === 'your_groq_api_key_here' || apiKey === '') {
  console.error('❌ Error: GROQ_API_KEY is missing or still set to the default placeholder in .env');
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function testKey() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Groq API Key (Llama 3) is Valid"' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log('✅ Success:', chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Groq API Key Test Failed:');
    console.error(error.message);
  }
}

testKey();
