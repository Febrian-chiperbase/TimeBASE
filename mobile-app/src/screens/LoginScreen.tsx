import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  useTheme,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  const { login, demoLogin } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const success = await demoLogin();
      if (!success) {
        Alert.alert('Demo Login Failed', 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View
            animation="fadeInDown"
            duration={1000}
            style={styles.header}
          >
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.logoText, { color: theme.colors.primary }]}>
                TB
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onPrimary }]}>
              Sign in to continue to TimeBASE
            </Text>
          </Animatable.View>

          {/* Login Form */}
          <Animatable.View
            animation="fadeInUp"
            delay={300}
            duration={1000}
            style={styles.formContainer}
          >
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  disabled={isLoading}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  disabled={isLoading}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <Divider style={styles.divider} />

                <Button
                  mode="outlined"
                  onPress={handleDemoLogin}
                  style={styles.demoButton}
                  contentStyle={styles.buttonContent}
                  disabled={isLoading}
                  icon="play-circle-outline"
                >
                  Try Demo
                </Button>
              </Card.Content>
            </Card>
          </Animatable.View>

          {/* Features */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={1000}
            style={styles.featuresContainer}
          >
            <Text style={[styles.featuresTitle, { color: theme.colors.onPrimary }]}>
              Why TimeBASE?
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="smart-toy" size={24} color={theme.colors.onPrimary} />
                <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                  AI-powered time suggestions
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="analytics" size={24} color={theme.colors.onPrimary} />
                <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                  Smart productivity analytics
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="schedule" size={24} color={theme.colors.onPrimary} />
                <Text style={[styles.featureText, { color: theme.colors.onPrimary }]}>
                  Intelligent task scheduling
                </Text>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 30,
  },
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  demoButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default LoginScreen;
