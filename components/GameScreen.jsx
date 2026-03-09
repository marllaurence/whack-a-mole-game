import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { styles } from './GameScreen.styles';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_RADIUS = 90;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function GameScreen({ score, setScore, onGameOver, soundWhack, soundBomb }) {
  const [entity, setEntity] = useState('EMPTY');
  const slideAnim = useRef(new Animated.Value(180)).current;
  const sparkAnim = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const plusOneAnimY = useRef(new Animated.Value(0)).current;
  const plusOneAnimOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const isTransitioning = useRef(false);

  const strokeDashoffset = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (entity === 'EMPTY') {
      isTransitioning.current = false;
      slideAnim.setValue(180);
      sparkAnim.setValue(1);
      timerAnim.setValue(1);
      const waitTime = Math.random() * 1200 + 1000;
      timerRef.current = setTimeout(() => {
        setEntity(Math.random() > 0.3 ? 'MOLE' : 'BOMB');
      }, waitTime);
    } else if (entity === 'MOLE') {
      timerAnim.setValue(1);
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start();
      
      const reactionTime = Math.max(1500 - score * 40, 600);
      
      Animated.timing(timerAnim, {
        toValue: 0,
        duration: reactionTime,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: 180, duration: 300, useNativeDriver: true }).start(() => {
          onGameOver();
        });
      }, reactionTime);
    } else if (entity === 'BOMB') {
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
          Animated.timing(sparkAnim, { toValue: 1, duration: 150, useNativeDriver: true })
        ])
      ).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: 180, duration: 350, useNativeDriver: true }).start(() => {
          setEntity('EMPTY');
        });
      }, 1200);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [entity, score]);

  const handleTap = () => {
    if (isTransitioning.current) return;

    if (entity === 'MOLE') {
      isTransitioning.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      slideAnim.stopAnimation();
      timerAnim.stopAnimation();
      
      if (soundWhack) {
        soundWhack.seekTo(0);
        soundWhack.play();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setScore((prev) => prev + 1);

      plusOneAnimY.setValue(0);
      plusOneAnimOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(plusOneAnimY, { toValue: -80, duration: 600, useNativeDriver: true }),
        Animated.timing(plusOneAnimOpacity, { toValue: 0, duration: 600, useNativeDriver: true })
      ]).start();
      
      Animated.timing(slideAnim, { toValue: 180, duration: 200, useNativeDriver: true }).start(() => {
        setEntity('EMPTY');
      });
    } else if (entity === 'BOMB') {
      isTransitioning.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      slideAnim.stopAnimation();
      timerAnim.stopAnimation();
      
      if (soundBomb) {
        soundBomb.seekTo(0);
        soundBomb.play();
      }
      onGameOver();
    }
  };

  return (
    <Pressable style={styles.fullScreenButton} onPress={handleTap}>
      <Text style={styles.inGameScore}>{score}</Text>
      
      <View style={styles.playArea}>
        <View style={styles.dirtBase} />
        
        <View style={styles.holeRim} />
        <View style={styles.holeOpening} />
        
        {entity === 'MOLE' && (
          <View style={styles.svgContainer}>
            <Svg width="200" height="200">
              <Circle 
                cx="100" 
                cy="100" 
                r={CIRCLE_RADIUS} 
                stroke="rgba(255, 76, 76, 0.2)" 
                strokeWidth="10" 
                fill="transparent" 
              />
              <AnimatedCircle
                cx="100" 
                cy="100" 
                r={CIRCLE_RADIUS}
                stroke="#FF4C4C" 
                strokeWidth="10" 
                fill="transparent"
                strokeDasharray={CIRCLE_CIRCUMFERENCE} 
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" 
                transform="rotate(-90 100 100)"
              />
            </Svg>
          </View>
        )}
        
        <View style={styles.maskContainer}>
          <Animated.View style={[{ transform: [{ translateY: slideAnim }] }, styles.entityContainer]}>
            {entity === 'MOLE' && (
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
            )}
            
            {entity === 'BOMB' && (
              <View style={styles.bombContainer}>
                <Animated.View style={[styles.bombSpark, { transform: [{ scale: sparkAnim }] }]} />
                <View style={styles.bombCap} />
                <View style={styles.bombBody}>
                  <View style={styles.bombHighlight} />
                </View>
              </View>
            )}
          </Animated.View>
        </View>
        
        <View style={styles.holeFrontLip} />

        <Animated.Text style={[styles.plusOneText, { 
          opacity: plusOneAnimOpacity, 
          transform: [{ translateY: plusOneAnimY }] 
        }]}>
          +1
        </Animated.Text>
      </View>
    </Pressable>
  );
}