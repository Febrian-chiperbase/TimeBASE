# Free AI APIs Setup Guide

## 🆓 **Daftar AI Services Gratis**

### **1. Hugging Face (Recommended)**
- **Website**: https://huggingface.co/
- **Free Tier**: 30,000 requests/month
- **Models**: Text generation, sentiment analysis, summarization
- **Setup**:
  1. Daftar akun gratis
  2. Buka Settings → Access Tokens
  3. Create new token
  4. Copy token ke `.env` file

```bash
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **2. Google Gemini (Powerful & Free)**
- **Website**: https://makersuite.google.com/
- **Free Tier**: 60 requests/minute
- **Models**: Gemini Pro (text generation)
- **Setup**:
  1. Daftar dengan Google account
  2. Create API key
  3. Copy key ke `.env` file

```bash
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **3. Cohere AI**
- **Website**: https://cohere.ai/
- **Free Tier**: 5,000 requests/month
- **Models**: Command (text generation)
- **Setup**:
  1. Daftar akun gratis
  2. Dashboard → API Keys
  3. Copy key ke `.env` file

```bash
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **4. OpenAI (Opsional - Berbayar)**
- **Website**: https://platform.openai.com/
- **Free Trial**: $5 credit untuk new users
- **Models**: GPT-3.5, GPT-4

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔧 **Installation & Setup**

### **1. Install Dependencies**
```bash
cd backend
npm install axios dotenv
```

### **2. Environment Configuration**
```bash
# Copy example file
cp .env.example .env

# Edit .env file dengan API keys Anda
nano .env
```

### **3. Update Server Routes**
```javascript
// backend/src/server.js
app.use('/api/free-ai', require('./routes/freeAI'));
```

### **4. Test API Connection**
```bash
# Test Hugging Face
curl -X POST "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium" \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Hello, how are you?"}'

# Test Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

## 🚀 **Usage Examples**

### **1. Schedule Optimization**
```javascript
// Frontend call
const response = await fetch('/api/free-ai/optimize-schedule', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        tasks: [
            {
                id: 1,
                title: "Buat laporan",
                estimatedDuration: 60,
                priority: "HIGH"
            }
        ],
        preferences: {
            workingHours: [9, 17],
            breakDuration: 15,
            maxContinuousWork: 90
        }
    })
});

const result = await response.json();
console.log(result.data.schedule);
```

### **2. Productivity Tips**
```javascript
const response = await fetch('/api/free-ai/productivity-tips', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        userMetrics: {
            averageTaskDuration: 45,
            completionRate: 85,
            mostProductiveHours: [9, 10, 14, 15]
        },
        goals: [
            "Meningkatkan fokus",
            "Mengurangi prokrastinasi"
        ]
    })
});

const tips = await response.json();
console.log(tips.data.tips);
```

### **3. Mood Analysis**
```javascript
const response = await fetch('/api/free-ai/mood-analysis', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        taskHistory: [
            {
                title: "Menyelesaikan project",
                description: "Berhasil menyelesaikan dengan baik"
            }
        ],
        currentContext: {
            timeOfDay: "morning",
            workload: "medium"
        }
    })
});

const analysis = await response.json();
console.log(analysis.data.moodPrediction);
```

## 📊 **Rate Limits & Best Practices**

### **Rate Limits per Service**
| Service | Free Limit | Reset Period |
|---------|------------|--------------|
| Hugging Face | 30,000/month | Monthly |
| Gemini | 60/minute | Per minute |
| Cohere | 5,000/month | Monthly |
| OpenAI | $5 credit | One-time |

### **Best Practices**
1. **Implement Fallbacks**: Selalu ada backup jika AI service gagal
2. **Cache Results**: Simpan hasil AI untuk mengurangi API calls
3. **Rate Limiting**: Batasi requests dari user
4. **Error Handling**: Graceful degradation ke rule-based system

### **Caching Strategy**
```javascript
const NodeCache = require('node-cache');
const aiCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Before AI call
const cacheKey = `ai_${userId}_${JSON.stringify(request)}`;
const cachedResult = aiCache.get(cacheKey);
if (cachedResult) {
    return cachedResult;
}

// After AI call
aiCache.set(cacheKey, result);
```

## 🔄 **Fallback Strategy**

### **Priority Order**
1. **Gemini** (Best for reasoning)
2. **Cohere** (Good for text generation)
3. **Hugging Face** (Reliable but slower)
4. **Rule-based Algorithm** (Always available)

### **Implementation**
```javascript
async function getAIResponse(prompt) {
    // Try Gemini first
    try {
        const result = await gemini.generateContent(prompt);
        if (result) return { result, service: 'gemini' };
    } catch (error) {
        console.log('Gemini failed, trying Cohere...');
    }
    
    // Fallback to Cohere
    try {
        const result = await cohere.generate(prompt);
        if (result) return { result, service: 'cohere' };
    } catch (error) {
        console.log('Cohere failed, trying Hugging Face...');
    }
    
    // Fallback to Hugging Face
    try {
        const result = await huggingFace.generateText(prompt);
        if (result) return { result, service: 'huggingface' };
    } catch (error) {
        console.log('All AI services failed, using rule-based...');
    }
    
    // Final fallback to rule-based
    return { result: ruleBasedResponse(prompt), service: 'rule-based' };
}
```

## 🛡️ **Security & Privacy**

### **API Key Security**
- Jangan commit API keys ke Git
- Gunakan environment variables
- Rotate keys secara berkala
- Monitor usage untuk detect abuse

### **Data Privacy**
- Jangan kirim data sensitif ke AI services
- Anonymize user data sebelum dikirim
- Implement data retention policies
- Comply dengan GDPR/privacy laws

## 📈 **Monitoring & Analytics**

### **Track Usage**
```javascript
const usage = {
    gemini: { requests: 0, errors: 0 },
    cohere: { requests: 0, errors: 0 },
    huggingface: { requests: 0, errors: 0 },
    ruleBased: { requests: 0 }
};

// Log setiap request
function logAIUsage(service, success) {
    usage[service].requests++;
    if (!success) usage[service].errors++;
}
```

### **Cost Monitoring**
```javascript
// Estimate costs
const costs = {
    gemini: usage.gemini.requests * 0, // Free
    cohere: usage.cohere.requests * 0, // Free tier
    huggingface: usage.huggingface.requests * 0, // Free
    openai: usage.openai.requests * 0.002 // $0.002 per request
};
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **API Key Invalid**
   ```
   Error: 401 Unauthorized
   Solution: Check API key format dan expiry
   ```

2. **Rate Limit Exceeded**
   ```
   Error: 429 Too Many Requests
   Solution: Implement exponential backoff
   ```

3. **Model Loading (Hugging Face)**
   ```
   Error: Model is loading
   Solution: Retry after 20 seconds
   ```

4. **Network Timeout**
   ```
   Error: Request timeout
   Solution: Increase timeout, implement retry
   ```

### **Debug Mode**
```javascript
// Enable debug logging
process.env.DEBUG_AI = 'true';

if (process.env.DEBUG_AI) {
    console.log('AI Request:', prompt);
    console.log('AI Response:', response);
    console.log('Service Used:', serviceName);
}
```

## 🎯 **Production Deployment**

### **Environment Variables**
```bash
# Production .env
NODE_ENV=production
HUGGINGFACE_API_TOKEN=hf_prod_token
GEMINI_API_KEY=gemini_prod_key
COHERE_API_KEY=cohere_prod_key
AI_RATE_LIMIT_PER_HOUR=100
AI_FALLBACK_ENABLED=true
```

### **Docker Configuration**
```dockerfile
# Dockerfile
ENV HUGGINGFACE_API_TOKEN=""
ENV GEMINI_API_KEY=""
ENV COHERE_API_KEY=""
```

### **Health Checks**
```javascript
// Health check endpoint
app.get('/health/ai', async (req, res) => {
    const status = {
        gemini: await testGeminiConnection(),
        cohere: await testCohereConnection(),
        huggingface: await testHuggingFaceConnection()
    };
    
    res.json({ status, healthy: Object.values(status).some(s => s) });
});
```

Dengan setup ini, Anda memiliki sistem AI yang robust dengan multiple fallbacks dan tidak bergantung pada satu service berbayar! 🚀
