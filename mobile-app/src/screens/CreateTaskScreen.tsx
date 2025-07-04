import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  useTheme,
  SegmentedButtons,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

import { useTask } from '../context/TaskContext';

const CreateTaskScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { createTask, getTimeSuggestion } = useTask();
  
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [category, setCategory] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // AI Suggestion states
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [timeSuggestion, setTimeSuggestion] = useState<any>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);

  // Debounce timer for AI suggestion
  useEffect(() => {
    if (taskName.trim().length >= 3) {
      const timer = setTimeout(() => {
        fetchTimeSuggestion(taskName.trim());
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setTimeSuggestion(null);
      setShowSuggestion(false);
    }
  }, [taskName]);

  const fetchTimeSuggestion = async (name: string) => {
    try {
      setIsLoadingSuggestion(true);
      const suggestion = await getTimeSuggestion(name);
      
      if (suggestion?.success && suggestion.data?.adaSaran) {
        setTimeSuggestion(suggestion.data);
        setShowSuggestion(true);
      } else {
        setTimeSuggestion(null);
        setShowSuggestion(false);
      }
    } catch (error) {
      console.error('Time suggestion error:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (timeSuggestion?.saranWaktu) {
      setEstimatedDuration(timeSuggestion.saranWaktu.toString());
      setSuggestionAccepted(true);
      setShowSuggestion(false);
    }
  };

  const handleRejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestionAccepted(false);
  };

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Task name is required');
      return;
    }
    
    if (!estimatedDuration || parseInt(estimatedDuration) <= 0) {
      Alert.alert('Error', 'Please provide a valid estimated duration');
      return;
    }

    setIsCreating(true);
    try {
      const taskData = {
        title: taskName.trim(),
        description: description.trim() || undefined,
        priority,
        category: category.trim() || undefined,
        estimatedDuration: parseInt(estimatedDuration),
        dueDate: dueDate?.toISOString(),
        status: 'ACTIVE' as const,
      };

      const success = await createTask(taskData);
      
      if (success) {
        Alert.alert('Success', 'Task created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create task. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Name Input */}
        <Animatable.View animation="fadeInUp" duration={600}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Task Details
              </Text>
              
              <TextInput
                label="Task Name *"
                value={taskName}
                onChangeText={setTaskName}
                mode="outlined"
                style={styles.input}
                placeholder="What do you need to do?"
              />
              
              <TextInput
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Add more details about this task..."
              />
              
              <TextInput
                label="Category (Optional)"
                value={category}
                onChangeText={setCategory}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Work, Personal, Study"
              />
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* AI Time Suggestion */}
        {isLoadingSuggestion && (
          <Animatable.View animation="fadeIn" duration={400}>
            <Card style={[styles.card, styles.suggestionCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.loadingContent}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                  Getting AI time suggestion...
                </Text>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {showSuggestion && timeSuggestion && (
          <Animatable.View animation="slideInUp" duration={600}>
            <Card style={[styles.card, styles.suggestionCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content>
                <View style={styles.suggestionHeader}>
                  <Text style={[styles.suggestionTitle, { color: theme.colors.onPrimaryContainer }]}>
                    🤖 AI Suggestion
                  </Text>
                </View>
                
                <Text style={[styles.suggestionTime, { color: theme.colors.onPrimaryContainer }]}>
                  Estimated Time: {formatDuration(timeSuggestion.saranWaktu)}
                </Text>
                
                <Text style={[styles.suggestionReason, { color: theme.colors.onPrimaryContainer }]}>
                  {timeSuggestion.pesan}
                </Text>
                
                <View style={styles.suggestionButtons}>
                  <Button
                    mode="contained"
                    onPress={handleAcceptSuggestion}
                    style={[styles.suggestionButton, { backgroundColor: theme.colors.secondary }]}
                    contentStyle={styles.buttonContent}
                  >
                    Accept
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleRejectSuggestion}
                    style={styles.suggestionButton}
                    contentStyle={styles.buttonContent}
                    textColor={theme.colors.onPrimaryContainer}
                  >
                    Set Manual
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        )}

        {/* Duration Input */}
        <Animatable.View animation="fadeInUp" delay={200} duration={600}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Time Estimation
              </Text>
              
              <TextInput
                label="Estimated Duration (minutes) *"
                value={estimatedDuration}
                onChangeText={setEstimatedDuration}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="How long will this take?"
                right={
                  estimatedDuration ? (
                    <TextInput.Affix text={formatDuration(parseInt(estimatedDuration) || 0)} />
                  ) : undefined
                }
              />
              
              {suggestionAccepted && (
                <Chip
                  icon="check-circle"
                  style={[styles.acceptedChip, { backgroundColor: theme.colors.secondaryContainer }]}
                  textStyle={{ color: theme.colors.onSecondaryContainer }}
                >
                  AI Suggestion Accepted
                </Chip>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Priority Selection */}
        <Animatable.View animation="fadeInUp" delay={400} duration={600}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Priority Level
              </Text>
              
              <SegmentedButtons
                value={priority}
                onValueChange={(value) => setPriority(value as 'HIGH' | 'MEDIUM' | 'LOW')}
                buttons={[
                  {
                    value: 'LOW',
                    label: 'Low',
                    icon: 'arrow-down',
                  },
                  {
                    value: 'MEDIUM',
                    label: 'Medium',
                    icon: 'minus',
                  },
                  {
                    value: 'HIGH',
                    label: 'High',
                    icon: 'arrow-up',
                  },
                ]}
                style={styles.segmentedButtons}
              />
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Due Date */}
        <Animatable.View animation="fadeInUp" delay={600} duration={600}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Due Date (Optional)
              </Text>
              
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                icon="calendar"
                style={styles.dateButton}
              >
                {dueDate ? dueDate.toLocaleDateString() : 'Set Due Date'}
              </Button>
              
              {dueDate && (
                <Button
                  mode="text"
                  onPress={() => setDueDate(null)}
                  textColor={theme.colors.error}
                  style={styles.clearDateButton}
                >
                  Clear Date
                </Button>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Create Button */}
        <Animatable.View animation="fadeInUp" delay={800} duration={600}>
          <Button
            mode="contained"
            onPress={handleCreateTask}
            disabled={isCreating || !taskName.trim() || !estimatedDuration}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              'Create Task'
            )}
          </Button>
        </Animatable.View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  suggestionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionReason: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  suggestionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  acceptedChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  dateButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  clearDateButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  createButton: {
    borderRadius: 12,
    marginTop: 16,
  },
  createButtonContent: {
    paddingVertical: 12,
  },
});

export default CreateTaskScreen;
