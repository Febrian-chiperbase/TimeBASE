const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test functions
async function testHealthCheck() {
    try {
        const response = await axios.get('http://localhost:3000/health');
        console.log('✅ Health Check:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        return false;
    }
}

async function testDemoLogin() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/demo-login`);
        authToken = response.data.data.token;
        console.log('✅ Demo Login Success:', response.data.data.user.name);
        return true;
    } catch (error) {
        console.error('❌ Demo Login Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateTask() {
    try {
        const response = await axios.post(`${BASE_URL}/tasks`, {
            title: 'Test Task',
            description: 'This is a test task',
            priority: 'HIGH',
            estimatedDuration: 60,
            category: 'testing'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Create Task Success:', response.data.data.title);
        return response.data.data.id;
    } catch (error) {
        console.error('❌ Create Task Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testGetTasks() {
    try {
        const response = await axios.get(`${BASE_URL}/tasks`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Get Tasks Success:', `${response.data.data.tasks.length} tasks found`);
        return true;
    } catch (error) {
        console.error('❌ Get Tasks Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testTimeSuggestion() {
    try {
        const response = await axios.post(`${BASE_URL}/simple-suggestion`, {
            namaTugas: 'Buat laporan testing'
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Time Suggestion Success:', response.data.data);
        return true;
    } catch (error) {
        console.error('❌ Time Suggestion Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testTaskRecommendation() {
    try {
        const response = await axios.get(`${BASE_URL}/tasks/recommended`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Task Recommendation Success:', response.data.data);
        return true;
    } catch (error) {
        console.error('❌ Task Recommendation Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testAnalytics() {
    try {
        const response = await axios.get(`${BASE_URL}/analytics/productivity`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Analytics Success:', response.data.data);
        return true;
    } catch (error) {
        console.error('❌ Analytics Failed:', error.response?.data || error.message);
        return false;
    }
}

async function testFreeAI() {
    try {
        const response = await axios.get(`${BASE_URL}/free-ai/status`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Free AI Status:', response.data.data);
        return true;
    } catch (error) {
        console.error('❌ Free AI Failed:', error.response?.data || error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting API Tests...\n');
    
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Demo Login', fn: testDemoLogin },
        { name: 'Create Task', fn: testCreateTask },
        { name: 'Get Tasks', fn: testGetTasks },
        { name: 'Time Suggestion', fn: testTimeSuggestion },
        { name: 'Task Recommendation', fn: testTaskRecommendation },
        { name: 'Analytics', fn: testAnalytics },
        { name: 'Free AI Status', fn: testFreeAI }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        console.log(`\n🧪 Testing ${test.name}...`);
        const result = await test.fn();
        if (result) {
            passed++;
        } else {
            failed++;
        }
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests };
