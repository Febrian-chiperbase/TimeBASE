import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  List,
  useTheme,
  Avatar,
  Button,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, isSystemTheme, setSystemTheme } = useThemeContext();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name || 'User')}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.colors.onSurface }]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Appearance
          </Text>
          
          <List.Item
            title="Dark Mode"
            description={isSystemTheme ? 'System default' : (isDarkMode ? 'On' : 'Off')}
            left={(props) => <List.Icon {...props} icon="brightness-6" />}
            right={(props) => (
              <Button
                mode="outlined"
                compact
                onPress={toggleTheme}
                disabled={isSystemTheme}
              >
                Toggle
              </Button>
            )}
          />
          
          <List.Item
            title="Use System Theme"
            description="Follow system dark/light mode"
            left={(props) => <List.Icon {...props} icon="phone-settings" />}
            right={(props) => (
              <Button
                mode={isSystemTheme ? 'contained' : 'outlined'}
                compact
                onPress={() => setSystemTheme(!isSystemTheme)}
              >
                {isSystemTheme ? 'On' : 'Off'}
              </Button>
            )}
          />
        </Card.Content>
      </Card>

      {/* Preferences */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Preferences
          </Text>
          
          <List.Item
            title="Working Hours"
            description="9:00 AM - 5:00 PM"
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // Navigate to settings screen
              navigation.navigate('Settings' as never);
            }}
          />
          
          <List.Item
            title="Break Duration"
            description="15 minutes"
            left={(props) => <List.Icon {...props} icon="coffee" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              navigation.navigate('Settings' as never);
            }}
          />
          
          <List.Item
            title="Notifications"
            description="Task reminders, Break alerts"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              navigation.navigate('Settings' as never);
            }}
          />
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            About
          </Text>
          
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
          
          <List.Item
            title="Help & Support"
            description="Get help with TimeBASE"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'For support, please contact us at support@timebase.app'
              );
            }}
          />
          
          <List.Item
            title="Privacy Policy"
            description="How we protect your data"
            left={(props) => <List.Icon {...props} icon="shield-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'Your privacy is important to us. All data is stored securely and never shared with third parties.'
              );
            }}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            icon="logout"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appInfoText, { color: theme.colors.onBackground }]}>
          TimeBASE - AI-Powered Time Management
        </Text>
        <Text style={[styles.appInfoText, { color: theme.colors.onBackground }]}>
          Made with ❤️ for productivity
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.7,
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
  logoutButton: {
    borderRadius: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 32,
  },
  appInfoText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
});

export default ProfileScreen;
