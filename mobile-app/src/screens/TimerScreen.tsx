import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  useTheme,
  IconButton,
  Chip,
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const TimerScreen: React.FC = () => {
  const theme = useTheme();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          if (mode === 'work') {
            setMode('break');
            setMinutes(5);
          } else {
            setMode('work');
            setMinutes(25);
          }
          setSeconds(0);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, mode]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work' 
    ? 1 - ((minutes * 60 + seconds) / (25 * 60))
    : 1 - ((minutes * 60 + seconds) / (5 * 60));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Focus Timer
        </Text>
        <Chip
          mode="outlined"
          style={[
            styles.modeChip,
            { 
              backgroundColor: mode === 'work' 
                ? theme.colors.primaryContainer 
                : theme.colors.secondaryContainer 
            }
          ]}
        >
          {mode === 'work' ? '🎯 Work Time' : '☕ Break Time'}
        </Chip>
      </View>

      <Animatable.View
        animation={isActive ? 'pulse' : undefined}
        iterationCount="infinite"
        duration={2000}
        style={styles.timerContainer}
      >
        <Card style={[styles.timerCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.timerContent}>
            <View style={[
              styles.progressRing,
              { borderColor: theme.colors.outline }
            ]}>
              <View style={[
                styles.progressFill,
                {
                  backgroundColor: mode === 'work' 
                    ? theme.colors.primary 
                    : theme.colors.secondary,
                  height: `${progress * 100}%`
                }
              ]} />
              
              <View style={styles.timerTextContainer}>
                <Text style={[styles.timerText, { color: theme.colors.onSurface }]}>
                  {formatTime(minutes, seconds)}
                </Text>
                <Text style={[styles.timerLabel, { color: theme.colors.onSurface }]}>
                  {mode === 'work' ? 'Focus Time' : 'Break Time'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>

      <View style={styles.controls}>
        <IconButton
          icon="refresh"
          size={32}
          onPress={reset}
          iconColor={theme.colors.outline}
          style={styles.controlButton}
        />
        
        <Button
          mode="contained"
          onPress={toggle}
          style={[
            styles.playButton,
            { backgroundColor: isActive ? theme.colors.error : theme.colors.primary }
          ]}
          contentStyle={styles.playButtonContent}
          icon={isActive ? 'pause' : 'play'}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        
        <IconButton
          icon="skip-next"
          size={32}
          onPress={() => {
            setMode(mode === 'work' ? 'break' : 'work');
            setMinutes(mode === 'work' ? 5 : 25);
            setSeconds(0);
            setIsActive(false);
          }}
          iconColor={theme.colors.outline}
          style={styles.controlButton}
        />
      </View>

      <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
            Pomodoro Technique
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurface }]}>
            • Work for 25 minutes with full focus{'\n'}
            • Take a 5-minute break{'\n'}
            • Repeat for maximum productivity
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modeChip: {
    paddingHorizontal: 8,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCard: {
    borderRadius: 20,
    elevation: 8,
    width: width * 0.8,
    height: width * 0.8,
  },
  timerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: width * 0.3,
  },
  timerTextContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -40 }],
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  controlButton: {
    margin: 0,
  },
  playButton: {
    borderRadius: 30,
    elevation: 4,
  },
  playButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  infoCard: {
    borderRadius: 12,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default TimerScreen;
