import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  useTheme,
  FAB,
  Chip,
  IconButton,
  Searchbar,
  Menu,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useTask, Task } from '../context/TaskContext';

const TasksScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { tasks, isLoading, fetchTasks, completeTask, deleteTask } = useTask();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && !task.isCompleted) ||
                         (filterStatus === 'COMPLETED' && task.isCompleted);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return theme.colors.error;
      case 'MEDIUM': return theme.colors.tertiary;
      case 'LOW': return theme.colors.secondary;
      default: return theme.colors.outline;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    Alert.alert(
      'Complete Task',
      'Mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeTask(taskId);
          },
        },
      ]
    );
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
          },
        },
      ]
    );
  };

  const renderTask = ({ item: task }: { item: Task }) => (
    <Card style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={[
              styles.taskTitle, 
              { 
                color: theme.colors.onSurface,
                textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                opacity: task.isCompleted ? 0.6 : 1,
              }
            ]}>
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
              
              {task.dueDate && (
                <Text style={[styles.taskDueDate, { color: theme.colors.onSurface }]}>
                  Due: {formatDate(task.dueDate)}
                </Text>
              )}
            </View>
            
            {task.description && (
              <Text style={[styles.taskDescription, { color: theme.colors.onSurface }]}>
                {task.description}
              </Text>
            )}
          </View>
          
          <View style={styles.taskActions}>
            {!task.isCompleted && (
              <IconButton
                icon="check"
                size={20}
                iconColor={theme.colors.secondary}
                onPress={() => handleCompleteTask(task.id)}
              />
            )}
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => handleDeleteTask(task.id)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="filter-list"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setFilterStatus('ALL');
              setMenuVisible(false);
            }}
            title="All Tasks"
            leadingIcon={filterStatus === 'ALL' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setFilterStatus('ACTIVE');
              setMenuVisible(false);
            }}
            title="Active Tasks"
            leadingIcon={filterStatus === 'ACTIVE' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => {
              setFilterStatus('COMPLETED');
              setMenuVisible(false);
            }}
            title="Completed Tasks"
            leadingIcon={filterStatus === 'COMPLETED' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChips}>
        <Chip
          selected={filterStatus === 'ALL'}
          onPress={() => setFilterStatus('ALL')}
          style={styles.filterChip}
        >
          All ({tasks.length})
        </Chip>
        <Chip
          selected={filterStatus === 'ACTIVE'}
          onPress={() => setFilterStatus('ACTIVE')}
          style={styles.filterChip}
        >
          Active ({tasks.filter(t => !t.isCompleted).length})
        </Chip>
        <Chip
          selected={filterStatus === 'COMPLETED'}
          onPress={() => setFilterStatus('COMPLETED')}
          style={styles.filterChip}
        >
          Done ({tasks.filter(t => t.isCompleted).length})
        </Chip>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTasks} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={64} color={theme.colors.outline} />
            <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
              {searchQuery ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.onSurface }]}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </Text>
            {!searchQuery && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateTask' as never)}
                style={styles.emptyButton}
              >
                Create Task
              </Button>
            )}
          </View>
        }
      />

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  priorityChip: {
    height: 24,
  },
  taskDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  taskDueDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  taskActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TasksScreen;
