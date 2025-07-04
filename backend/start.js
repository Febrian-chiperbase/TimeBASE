const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TimeBASE Backend Server...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    const envExample = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExample)) {
        fs.copyFileSync(envExample, envPath);
        console.log('✅ .env file created. Please update with your API keys.\n');
    } else {
        console.log('⚠️  .env.example not found. Creating basic .env file...');
        const basicEnv = `NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/timebase
JWT_SECRET=your_jwt_secret_key_here

# Free AI API Keys (Optional)
HUGGINGFACE_API_TOKEN=
GEMINI_API_KEY=
COHERE_API_KEY=

# Rate Limiting
AI_RATE_LIMIT_PER_HOUR=50
AI_FALLBACK_ENABLED=true
`;
        fs.writeFileSync(envPath, basicEnv);
        console.log('✅ Basic .env file created.\n');
    }
}

// Start the server
const server = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
    console.log(`\n🛑 Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
});
