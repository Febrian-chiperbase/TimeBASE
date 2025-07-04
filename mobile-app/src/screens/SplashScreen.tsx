import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.content}>
        <Animatable.View
          animation="bounceIn"
          duration={1500}
          style={styles.logoContainer}
        >
          <View style={[styles.logo, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              TB
            </Text>
          </View>
        </Animatable.View>

        <Animatable.Text
          animation="fadeInUp"
          delay={500}
          duration={1000}
          style={[styles.title, { color: theme.colors.onPrimary }]}
        >
          TimeBASE
        </Animatable.Text>

        <Animatable.Text
          animation="fadeInUp"
          delay={800}
          duration={1000}
          style={[styles.subtitle, { color: theme.colors.onPrimary }]}
        >
          AI-Powered Time Management
        </Animatable.Text>

        <Animatable.View
          animation="fadeIn"
          delay={1200}
          duration={1000}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingDots}>
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              style={[styles.dot, { backgroundColor: theme.colors.onPrimary }]}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              delay={200}
              style={[styles.dot, { backgroundColor: theme.colors.onPrimary }]}
            />
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1000}
              delay={400}
              style={[styles.dot, { backgroundColor: theme.colors.onPrimary }]}
            />
          </View>
        </Animatable.View>
      </View>

      <Animatable.Text
        animation="fadeIn"
        delay={1500}
        duration={1000}
        style={[styles.version, { color: theme.colors.onPrimary }]}
      >
        Version 1.0.0
      </Animatable.Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingContainer: {
    marginTop: 30,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    opacity: 0.7,
  },
});

export default SplashScreen;
