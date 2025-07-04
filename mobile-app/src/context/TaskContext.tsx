import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  category?: string;
  estimatedDuration: number;
  actualDuration?: number;
  dueDate?: string;
  scheduledTime?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskScore {
  taskId: string;
  priorityScore: number;
  urgencyScore: number;
  totalScore: number;
  estimatedDuration: number;
  reasoning: string;
}

interface TaskContextType {
  tasks: Task[];
  recommendedTasks: TaskScore[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<boolean>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  completeTask: (taskId: string, actualDuration?: number) => Promise<boolean>;
  getTimeSuggestion: (taskName: string) => Promise<any>;
  fetchRecommendedTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<TaskScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchRecommendedTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getTasks();
      
      if (response.success) {
        setTasks(response.data.tasks || []);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      setError('Network error while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendedTasks = async () => {
    try {
      const response = await apiService.getRecommendedTasks();
      
      if (response.success) {
        setRecommendedTasks(response.data.recommendedTasks || []);
      }
    } catch (error) {
      console.error('Fetch recommended tasks error:', error);
    }
  };

  const createTask = async (taskData: Partial<Task>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.createTask(taskData);
      
      if (response.success) {
        await fetchTasks();
        await fetchRecommendedTasks();
        return true;
      } else {
        setError('Failed to create task');
        return false;
      }
    } catch (error) {
      console.error('Create task error:', error);
      setError('Network error while creating task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.updateTask(taskId, taskData);
      
      if (response.success) {
        await fetchTasks();
        await fetchRecommendedTasks();
        return true;
      } else {
        setError('Failed to update task');
        return false;
      }
    } catch (error) {
      console.error('Update task error:', error);
      setError('Network error while updating task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.deleteTask(taskId);
      
      if (response.success) {
        await fetchTasks();
        await fetchRecommendedTasks();
        return true;
      } else {
        setError('Failed to delete task');
        return false;
      }
    } catch (error) {
      console.error('Delete task error:', error);
      setError('Network error while deleting task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId: string, actualDuration?: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.completeTask(taskId, actualDuration);
      
      if (response.success) {
        await fetchTasks();
        await fetchRecommendedTasks();
        return true;
      } else {
        setError('Failed to complete task');
        return false;
      }
    } catch (error) {
      console.error('Complete task error:', error);
      setError('Network error while completing task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSuggestion = async (taskName: string) => {
    try {
      const response = await apiService.getTimeSuggestion(taskName);
      return response;
    } catch (error) {
      console.error('Time suggestion error:', error);
      return null;
    }
  };

  const value: TaskContextType = {
    tasks,
    recommendedTasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getTimeSuggestion,
    fetchRecommendedTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
