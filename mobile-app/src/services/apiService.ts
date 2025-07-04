import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL - Update this to your backend URL
const BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Android emulator
  : 'https://your-production-api.com/api';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          await this.handleTokenExpired();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleTokenExpired() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      this.authToken = null;
      // You might want to navigate to login screen here
    } catch (error) {
      console.error('Error handling token expiration:', error);
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<any> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(name: string, email: string, password: string): Promise<any> {
    const response = await this.api.post('/auth/register', { name, email, password });
    return response.data;
  }

  async demoLogin(): Promise<any> {
    const response = await this.api.post('/auth/demo-login');
    return response.data;
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: any): Promise<any> {
    const response = await this.api.get('/tasks', { params });
    return response.data;
  }

  async getTaskById(taskId: string): Promise<any> {
    const response = await this.api.get(`/tasks/${taskId}`);
    return response.data;
  }

  async createTask(taskData: any): Promise<any> {
    const response = await this.api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(taskId: string, taskData: any): Promise<any> {
    const response = await this.api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<any> {
    const response = await this.api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  async completeTask(taskId: string, actualDuration?: number): Promise<any> {
    const response = await this.api.patch(`/tasks/${taskId}/complete`, { actualDuration });
    return response.data;
  }

  async updateTaskStatus(taskId: string, status: string): Promise<any> {
    const response = await this.api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  }

  // Recommendation endpoints
  async getRecommendedTasks(limit?: number): Promise<any> {
    const response = await this.api.get('/tasks/recommended', { 
      params: { limit } 
    });
    return response.data;
  }

  async getTaskStatistics(): Promise<any> {
    const response = await this.api.get('/tasks/statistics');
    return response.data;
  }

  // Time suggestion endpoints
  async getTimeSuggestion(taskName: string): Promise<any> {
    const response = await this.api.post('/simple-suggestion', { 
      namaTugas: taskName 
    });
    return response.data;
  }

  // Analytics endpoints
  async getProductivityStats(period?: string): Promise<any> {
    const response = await this.api.get('/analytics/productivity', {
      params: { period }
    });
    return response.data;
  }

  async getCategoryPerformance(): Promise<any> {
    const response = await this.api.get('/analytics/categories');
    return response.data;
  }

  async getTimeTrackingStats(): Promise<any> {
    const response = await this.api.get('/analytics/time-tracking');
    return response.data;
  }

  // User endpoints
  async getUserProfile(): Promise<any> {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(profileData: any): Promise<any> {
    const response = await this.api.put('/users/profile', profileData);
    return response.data;
  }

  async updateUserPreferences(preferences: any): Promise<any> {
    const response = await this.api.put('/users/preferences', preferences);
    return response.data;
  }

  // AI endpoints
  async getProductivityTips(userMetrics: any, goals: any[]): Promise<any> {
    const response = await this.api.post('/free-ai/productivity-tips', {
      userMetrics,
      goals
    });
    return response.data;
  }

  async optimizeSchedule(tasks: any[], preferences: any): Promise<any> {
    const response = await this.api.post('/free-ai/optimize-schedule', {
      tasks,
      preferences
    });
    return response.data;
  }

  async getAIStatus(): Promise<any> {
    const response = await this.api.get('/free-ai/status');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
