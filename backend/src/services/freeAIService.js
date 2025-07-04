const axios = require('axios');

/**
 * Free AI Service menggunakan Hugging Face API (Gratis)
 * Daftar di: https://huggingface.co/
 */
class FreeAIService {
    
    constructor() {
        // Hugging Face API Token (Gratis)
        this.hfToken = process.env.HUGGINGFACE_API_TOKEN || 'hf_your_free_token_here';
        this.baseURL = 'https://api-inference.huggingface.co/models';
    }
    
    /**
     * Generate text menggunakan model gratis dari Hugging Face
     */
    async generateText(prompt, model = 'microsoft/DialoGPT-medium') {
        try {
            const response = await axios.post(
                `${this.baseURL}/${model}`,
                {
                    inputs: prompt,
                    parameters: {
                        max_length: 200,
                        temperature: 0.7,
                        do_sample: true
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.hfToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data[0]?.generated_text || '';
        } catch (error) {
            console.error('Hugging Face API Error:', error.response?.data || error.message);
            return null;
        }
    }
    
    /**
     * Analisis sentimen menggunakan model gratis
     */
    async analyzeSentiment(text) {
        try {
            const response = await axios.post(
                `${this.baseURL}/cardiffnlp/twitter-roberta-base-sentiment-latest`,
                {
                    inputs: text
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.hfToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data[0];
        } catch (error) {
            console.error('Sentiment Analysis Error:', error.response?.data || error.message);
            return null;
        }
    }
    
    /**
     * Text summarization menggunakan model gratis
     */
    async summarizeText(text) {
        try {
            const response = await axios.post(
                `${this.baseURL}/facebook/bart-large-cnn`,
                {
                    inputs: text,
                    parameters: {
                        max_length: 100,
                        min_length: 30
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.hfToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data[0]?.summary_text || '';
        } catch (error) {
            console.error('Summarization Error:', error.response?.data || error.message);
            return null;
        }
    }
}

/**
 * Alternative: Cohere AI (Free Tier)
 * Daftar di: https://cohere.ai/
 */
class CohereAIService {
    
    constructor() {
        this.apiKey = process.env.COHERE_API_KEY || 'your_free_cohere_key';
        this.baseURL = 'https://api.cohere.ai/v1';
    }
    
    async generate(prompt) {
        try {
            const response = await axios.post(
                `${this.baseURL}/generate`,
                {
                    model: 'command-light', // Model gratis
                    prompt: prompt,
                    max_tokens: 200,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data.generations[0]?.text || '';
        } catch (error) {
            console.error('Cohere API Error:', error.response?.data || error.message);
            return null;
        }
    }
}

/**
 * Alternative: Google AI Studio (Gemini Free)
 * Daftar di: https://makersuite.google.com/
 */
class GeminiAIService {
    
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || 'your_free_gemini_key';
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    }
    
    async generateContent(prompt) {
        try {
            const response = await axios.post(
                `${this.baseURL}/gemini-pro:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = {
    FreeAIService,
    CohereAIService,
    GeminiAIService
};
