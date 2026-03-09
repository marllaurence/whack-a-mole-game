import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { styles } from './SplashScreen.styles';

export default function SplashScreen({ onStart, highScore }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -15, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim, floatAnim]);

  return (
    <Pressable style={styles.fullScreenButton} onPress={onStart}>
      <Animated.View style={[styles.splashLogoContainer, { transform: [{ translateY: floatAnim }] }]}>
        <View style={styles.moleBody}>
          <View style={styles.moleEyesContainer}>
            <View style={styles.moleEye} />
            <View style={styles.moleEye} />
          </View>
          <View style={styles.moleNose} />
          <View style={styles.moleMouth}>
            <View style={styles.moleTooth} />
          </View>
        </View>
      </Animated.View>

      <Text style={styles.title}>WHACK-A-MOLE</Text>
      
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>High Score: {highScore}</Text>
      </View>
      
      <Animated.Text style={[styles.subtitle, { opacity: pulseAnim }]}>
        TAP ANYWHERE TO START
      </Animated.Text>
    </Pressable>
  );
}