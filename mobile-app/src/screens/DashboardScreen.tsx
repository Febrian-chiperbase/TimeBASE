import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  useTheme,
  Button,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { tasks, recommendedTasks, fetchTasks, fetchRecommendedTasks } = useTask();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    completionRate: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const calculateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const activeTasks = tasks.filter(task => !task.isCompleted && task.status === 'ACTIVE').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    setStats({
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTasks(),
      fetchRecommendedTasks(),
    ]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return theme.colors.error;
      case 'MEDIUM':
        return theme.colors.tertiary;
      case 'LOW':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <Animatable.View animation="fadeInDown" duration={1000}>
            <Text style={[styles.greeting, { color: theme.colors.onPrimary }]}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.onPrimary }]}>
              Let's make today productive
            </Text>
          </Animatable.View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animatable.View animation="fadeInLeft" delay={200} duration={800}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Icon name="assignment" size={24} color={theme.colors.primary} />
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {stats.totalTasks}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                  Total Tasks
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>

          <Animatable.View animation="fadeInRight" delay={400} duration={800}>
            <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.statContent}>
                <View style={styles.statHeader}>
                  <Icon name="check-circle" size={24} color={theme.colors.secondary} />
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                    {stats.completedTasks}
                  </Text>
                </View>
                <Text style={[styles.statLabel, { color: theme.colors.onSurface }]}>
                  Completed
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        </View>

        {/* Progress Card */}
        <Animatable.View animation="fadeInUp" delay={600} duration={800}>
          <Card style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>
                  Today's Progress
                </Text>
                <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                  {Math.round(stats.completionRate)}%
                </Text>
              </View>
              <ProgressBar
                progress={stats.completionRate / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={[styles.progressSubtitle, { color: theme.colors.onSurface }]}>
                {stats.activeTasks} active tasks remaining
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Recommended Tasks */}
        <Animatable.View animation="fadeInUp" delay={800} duration={800}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Recommended Tasks
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Tasks' as never)}
              compact
            >
              View All
            </Button>
          </View>

          {recommendedTasks.slice(0, 3).map((taskScore, index) => {
            const task = tasks.find(t => t.id === taskScore.taskId);
            if (!task) return null;

            return (
              <Card
                key={task.id}
                style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}
              >
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, { color: theme.colors.onSurface }]}>
                        {task.title}
                      </Text>
                      <View style={styles.taskMeta}>
                        <Chip
                          mode="outlined"
                          compact
                          style={[styles.priorityChip, { borderColor: getPriorityColor(task.priority) }]}
                          textStyle={{ color: getPriorityColor(task.priority), fontSize: 10 }}
                        >
                          {task.priority}
                        </Chip>
                        <Text style={[styles.taskDuration, { color: theme.colors.onSurface }]}>
                          {formatDuration(task.estimatedDuration)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.taskScore}>
                      <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>
                        {taskScore.totalScore}
                      </Text>
                      <Text style={[styles.scoreLabel, { color: theme.colors.onSurface }]}>
                        score
                      </Text>
                    </View>
                  </View>
                  {task.description && (
                    <Text style={[styles.taskDescription, { color: theme.colors.onSurface }]}>
                      {task.description}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            );
          })}

          {recommendedTasks.length === 0 && (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="lightbulb-outline" size={48} color={theme.colors.outline} />
                <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  No recommendations yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.onSurface }]}>
                  Create some tasks to get AI-powered recommendations
                </Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CreateTask' as never)}
                  style={styles.emptyButton}
                >
                  Create Task
                </Button>
              </Card.Content>
            </Card>
          )}
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" delay={1000} duration={800}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('Timer' as never)}
            >
              <Icon name="timer" size={32} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.onSurface }]}>
                Start Timer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('Analytics' as never)}
            >
              <Icon name="analytics" size={32} color={theme.colors.secondary} />
              <Text style={[styles.quickActionText, { color: theme.colors.onSurface }]}>
                View Stats
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateTask' as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  progressCard: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityChip: {
    height: 24,
  },
  taskDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  taskScore: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
  },
  emptyCard: {
    margin: 20,
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 100,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
