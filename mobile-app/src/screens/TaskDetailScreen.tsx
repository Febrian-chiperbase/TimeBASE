import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  useTheme,
  Chip,
  Button,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TaskDetailScreen: React.FC = () => {
  const theme = useTheme();

  // This would normally receive task data from navigation params
  const mockTask = {
    id: '1',
    title: 'Complete Project Documentation',
    description: 'Write comprehensive documentation for the TimeBASE project including API docs, user guide, and technical specifications.',
    priority: 'HIGH',
    category: 'Work',
    estimatedDuration: 120,
    actualDuration: 95,
    dueDate: '2025-07-05T10:00:00Z',
    isCompleted: true,
    createdAt: '2025-07-03T09:00:00Z',
    completedAt: '2025-07-03T11:35:00Z',
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return theme.colors.error;
      case 'MEDIUM': return theme.colors.tertiary;
      case 'LOW': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const getAccuracy = () => {
    if (mockTask.actualDuration && mockTask.estimatedDuration) {
      return (mockTask.actualDuration / mockTask.estimatedDuration) * 100;
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Task Header */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                {mockTask.title}
              </Text>
              <View style={styles.badges}>
                <Chip
                  mode="outlined"
                  style={[styles.priorityChip, { borderColor: getPriorityColor(mockTask.priority) }]}
                  textStyle={{ color: getPriorityColor(mockTask.priority) }}
                >
                  {mockTask.priority}
                </Chip>
                {mockTask.category && (
                  <Chip mode="outlined" style={styles.categoryChip}>
                    {mockTask.category}
                  </Chip>
                )}
                <Chip
                  mode="flat"
                  style={[
                    styles.statusChip,
                    { backgroundColor: mockTask.isCompleted ? theme.colors.secondaryContainer : theme.colors.tertiaryContainer }
                  ]}
                  textStyle={{ 
                    color: mockTask.isCompleted ? theme.colors.onSecondaryContainer : theme.colors.onTertiaryContainer 
                  }}
                  icon={mockTask.isCompleted ? 'check-circle' : 'clock'}
                >
                  {mockTask.isCompleted ? 'Completed' : 'In Progress'}
                </Chip>
              </View>
            </View>
          </View>
          
          {mockTask.description && (
            <>
              <Divider style={styles.divider} />
              <Text style={[styles.description, { color: theme.colors.onSurface }]}>
                {mockTask.description}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Time Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Time Information
          </Text>
          
          <View style={styles.timeInfo}>
            <View style={styles.timeItem}>
              <Icon name="schedule" size={24} color={theme.colors.primary} />
              <View style={styles.timeDetails}>
                <Text style={[styles.timeLabel, { color: theme.colors.onSurface }]}>
                  Estimated Duration
                </Text>
                <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>
                  {formatDuration(mockTask.estimatedDuration)}
                </Text>
              </View>
            </View>
            
            {mockTask.actualDuration && (
              <View style={styles.timeItem}>
                <Icon name="timer" size={24} color={theme.colors.secondary} />
                <View style={styles.timeDetails}>
                  <Text style={[styles.timeLabel, { color: theme.colors.onSurface }]}>
                    Actual Duration
                  </Text>
                  <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>
                    {formatDuration(mockTask.actualDuration)}
                  </Text>
                </View>
              </View>
            )}
            
            {getAccuracy() && (
              <View style={styles.timeItem}>
                <Icon 
                  name="target" 
                  size={24} 
                  color={getAccuracy()! >= 80 && getAccuracy()! <= 120 ? theme.colors.secondary : theme.colors.tertiary} 
                />
                <View style={styles.timeDetails}>
                  <Text style={[styles.timeLabel, { color: theme.colors.onSurface }]}>
                    Estimation Accuracy
                  </Text>
                  <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>
                    {Math.round(getAccuracy()!)}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Dates */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Important Dates
          </Text>
          
          <View style={styles.dateInfo}>
            <View style={styles.dateItem}>
              <Icon name="event" size={20} color={theme.colors.outline} />
              <View style={styles.dateDetails}>
                <Text style={[styles.dateLabel, { color: theme.colors.onSurface }]}>
                  Created
                </Text>
                <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>
                  {formatDate(mockTask.createdAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.dateItem}>
              <Icon name="event-available" size={20} color={theme.colors.outline} />
              <View style={styles.dateDetails}>
                <Text style={[styles.dateLabel, { color: theme.colors.onSurface }]}>
                  Due Date
                </Text>
                <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>
                  {formatDate(mockTask.dueDate)}
                </Text>
              </View>
            </View>
            
            {mockTask.completedAt && (
              <View style={styles.dateItem}>
                <Icon name="check-circle" size={20} color={theme.colors.secondary} />
                <View style={styles.dateDetails}>
                  <Text style={[styles.dateLabel, { color: theme.colors.onSurface }]}>
                    Completed
                  </Text>
                  <Text style={[styles.dateValue, { color: theme.colors.onSurface }]}>
                    {formatDate(mockTask.completedAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Actions
          </Text>
          
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="edit"
              style={styles.actionButton}
              onPress={() => {
                // Navigate to edit task
              }}
            >
              Edit Task
            </Button>
            
            <Button
              mode="outlined"
              icon="content-duplicate"
              style={styles.actionButton}
              onPress={() => {
                // Duplicate task
              }}
            >
              Duplicate
            </Button>
            
            <Button
              mode="outlined"
              icon="delete"
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
              textColor={theme.colors.error}
              onPress={() => {
                // Delete task
              }}
            >
              Delete
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    height: 32,
  },
  categoryChip: {
    height: 32,
  },
  statusChip: {
    height: 32,
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeInfo: {
    gap: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDetails: {
    marginLeft: 16,
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateInfo: {
    gap: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  dateDetails: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
});

export default TaskDetailScreen;
