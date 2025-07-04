import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  useTheme,
  SegmentedButtons,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

import { useTask } from '../context/TaskContext';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeSpent: number;
  averageTaskDuration: number;
  averageAccuracy: number;
}

const AnalyticsScreen: React.FC = () => {
  const theme = useTheme();
  const { tasks } = useTask();
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState<ProductivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProductivityStats(period);
      
      if (response.success) {
        setStats(response.data);
      } else {
        // Fallback to local calculation
        calculateLocalStats();
      }
    } catch (error) {
      console.error('Analytics error:', error);
      calculateLocalStats();
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLocalStats = () => {
    const completedTasks = tasks.filter(task => task.isCompleted);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const totalTimeSpent = completedTasks.reduce((sum, task) => 
      sum + (task.actualDuration || task.estimatedDuration), 0
    );
    
    const averageTaskDuration = completedTasks.length > 0 
      ? totalTimeSpent / completedTasks.length 
      : 0;

    const tasksWithBothDurations = completedTasks.filter(task => 
      task.actualDuration && task.estimatedDuration
    );
    
    const averageAccuracy = tasksWithBothDurations.length > 0
      ? tasksWithBothDurations.reduce((sum, task) => 
          sum + (task.actualDuration! / task.estimatedDuration), 0
        ) / tasksWithBothDurations.length
      : 1;

    setStats({
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      totalTimeSpent,
      averageTaskDuration,
      averageAccuracy,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return theme.colors.secondary;
    if (rate >= 60) return theme.colors.tertiary;
    return theme.colors.error;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8 && accuracy <= 1.2) return theme.colors.secondary;
    if (accuracy >= 0.6 && accuracy <= 1.4) return theme.colors.tertiary;
    return theme.colors.error;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchAnalytics} />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodContainer}>
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
      </View>

      {stats && (
        <>
          {/* Overview Cards */}
          <View style={styles.overviewContainer}>
            <Animatable.View animation="fadeInLeft" delay={100} duration={600}>
              <Card style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.overviewContent}>
                  <Icon name="assignment" size={32} color={theme.colors.primary} />
                  <Text style={[styles.overviewValue, { color: theme.colors.onSurface }]}>
                    {stats.totalTasks}
                  </Text>
                  <Text style={[styles.overviewLabel, { color: theme.colors.onSurface }]}>
                    Total Tasks
                  </Text>
                </Card.Content>
              </Card>
            </Animatable.View>

            <Animatable.View animation="fadeInRight" delay={200} duration={600}>
              <Card style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.overviewContent}>
                  <Icon name="check-circle" size={32} color={theme.colors.secondary} />
                  <Text style={[styles.overviewValue, { color: theme.colors.onSurface }]}>
                    {stats.completedTasks}
                  </Text>
                  <Text style={[styles.overviewLabel, { color: theme.colors.onSurface }]}>
                    Completed
                  </Text>
                </Card.Content>
              </Card>
            </Animatable.View>
          </View>

          {/* Completion Rate */}
          <Animatable.View animation="fadeInUp" delay={300} duration={600}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Completion Rate
                  </Text>
                  <Text style={[
                    styles.cardValue, 
                    { color: getCompletionColor(stats.completionRate) }
                  ]}>
                    {Math.round(stats.completionRate)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={stats.completionRate / 100}
                  color={getCompletionColor(stats.completionRate)}
                  style={styles.progressBar}
                />
                <Text style={[styles.cardSubtitle, { color: theme.colors.onSurface }]}>
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Time Statistics */}
          <Animatable.View animation="fadeInUp" delay={400} duration={600}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                  Time Statistics
                </Text>
                
                <View style={styles.timeStatsContainer}>
                  <View style={styles.timeStat}>
                    <Icon name="schedule" size={24} color={theme.colors.primary} />
                    <View style={styles.timeStatText}>
                      <Text style={[styles.timeStatValue, { color: theme.colors.onSurface }]}>
                        {formatDuration(stats.totalTimeSpent)}
                      </Text>
                      <Text style={[styles.timeStatLabel, { color: theme.colors.onSurface }]}>
                        Total Time
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.timeStat}>
                    <Icon name="avg-pace" size={24} color={theme.colors.secondary} />
                    <View style={styles.timeStatText}>
                      <Text style={[styles.timeStatValue, { color: theme.colors.onSurface }]}>
                        {formatDuration(Math.round(stats.averageTaskDuration))}
                      </Text>
                      <Text style={[styles.timeStatLabel, { color: theme.colors.onSurface }]}>
                        Avg Duration
                      </Text>
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Estimation Accuracy */}
          <Animatable.View animation="fadeInUp" delay={500} duration={600}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                    Estimation Accuracy
                  </Text>
                  <Text style={[
                    styles.cardValue, 
                    { color: getAccuracyColor(stats.averageAccuracy) }
                  ]}>
                    {Math.round(stats.averageAccuracy * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(stats.averageAccuracy, 2) / 2}
                  color={getAccuracyColor(stats.averageAccuracy)}
                  style={styles.progressBar}
                />
                <Text style={[styles.cardSubtitle, { color: theme.colors.onSurface }]}>
                  {stats.averageAccuracy > 1.2 
                    ? 'You tend to underestimate task duration'
                    : stats.averageAccuracy < 0.8
                    ? 'You tend to overestimate task duration'
                    : 'Your time estimates are quite accurate!'
                  }
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Productivity Tips */}
          <Animatable.View animation="fadeInUp" delay={600} duration={600}>
            <Card style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content>
                <View style={styles.tipsHeader}>
                  <Icon name="lightbulb" size={24} color={theme.colors.onPrimaryContainer} />
                  <Text style={[styles.tipsTitle, { color: theme.colors.onPrimaryContainer }]}>
                    Productivity Tips
                  </Text>
                </View>
                
                <View style={styles.tipsList}>
                  {stats.completionRate < 70 && (
                    <Text style={[styles.tipText, { color: theme.colors.onPrimaryContainer }]}>
                      • Try breaking large tasks into smaller, manageable pieces
                    </Text>
                  )}
                  {stats.averageAccuracy > 1.3 && (
                    <Text style={[styles.tipText, { color: theme.colors.onPrimaryContainer }]}>
                      • Consider adding buffer time to your estimates
                    </Text>
                  )}
                  {stats.averageAccuracy < 0.7 && (
                    <Text style={[styles.tipText, { color: theme.colors.onPrimaryContainer }]}>
                      • Your estimates might be too conservative, try being more optimistic
                    </Text>
                  )}
                  <Text style={[styles.tipText, { color: theme.colors.onPrimaryContainer }]}>
                    • Use the Pomodoro timer for better focus
                  </Text>
                  <Text style={[styles.tipText, { color: theme.colors.onPrimaryContainer }]}>
                    • Review your daily progress to stay motivated
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  periodContainer: {
    marginBottom: 20,
  },
  overviewContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  overviewContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  overviewLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  timeStatsContainer: {
    marginTop: 16,
  },
  timeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeStatText: {
    marginLeft: 16,
  },
  timeStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AnalyticsScreen;
