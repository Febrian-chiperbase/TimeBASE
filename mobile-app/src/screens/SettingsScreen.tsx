import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  List,
  useTheme,
  Switch,
  Button,
} from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [breakReminders, setBreakReminders] = React.useState(true);
  const [dailySummary, setDailySummary] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Notifications */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Notifications
          </Text>
          
          <List.Item
            title="Enable Notifications"
            description="Receive task reminders and alerts"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          
          <List.Item
            title="Break Reminders"
            description="Get reminded to take breaks"
            left={(props) => <List.Icon {...props} icon="coffee" />}
            right={() => (
              <Switch
                value={breakReminders}
                onValueChange={setBreakReminders}
                disabled={!notificationsEnabled}
              />
            )}
          />
          
          <List.Item
            title="Daily Summary"
            description="Receive end-of-day productivity summary"
            left={(props) => <List.Icon {...props} icon="chart-line" />}
            right={() => (
              <Switch
                value={dailySummary}
                onValueChange={setDailySummary}
                disabled={!notificationsEnabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Work Preferences */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Work Preferences
          </Text>
          
          <List.Item
            title="Working Hours"
            description="9:00 AM - 5:00 PM"
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Default Break Duration"
            description="15 minutes"
            left={(props) => <List.Icon {...props} icon="pause-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Max Continuous Work"
            description="90 minutes"
            left={(props) => <List.Icon {...props} icon="timer-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Data & Privacy */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Data & Privacy
          </Text>
          
          <List.Item
            title="Export Data"
            description="Download your tasks and analytics"
            left={(props) => <List.Icon {...props} icon="download" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Clear Cache"
            description="Free up storage space"
            left={(props) => <List.Icon {...props} icon="cached" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Reset All Settings"
            description="Restore default preferences"
            left={(props) => <List.Icon {...props} icon="restore" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Danger Zone */}
      <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onErrorContainer }]}>
            Danger Zone
          </Text>
          
          <Text style={[styles.warningText, { color: theme.colors.onErrorContainer }]}>
            These actions cannot be undone. Please be careful.
          </Text>
          
          <View style={styles.dangerActions}>
            <Button
              mode="outlined"
              textColor={theme.colors.error}
              style={[styles.dangerButton, { borderColor: theme.colors.error }]}
            >
              Delete All Tasks
            </Button>
            
            <Button
              mode="outlined"
              textColor={theme.colors.error}
              style={[styles.dangerButton, { borderColor: theme.colors.error }]}
            >
              Delete Account
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  dangerActions: {
    gap: 12,
  },
  dangerButton: {
    borderRadius: 8,
  },
});

export default SettingsScreen;
