import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { styles } from './GameScreen.styles';

function Hole({ score, setScore, onGameOver, soundWhack, soundBomb }) {
  const [entity, setEntity] = useState('EMPTY');
  const slideAnim = useRef(new Animated.Value(90)).current;
  const sparkAnim = useRef(new Animated.Value(1)).current;
  const plusOneAnimY = useRef(new Animated.Value(0)).current;
  const plusOneAnimOpacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (entity === 'EMPTY') {
      isTransitioning.current = false;
      slideAnim.setValue(90);
      sparkAnim.setValue(1);
      
      const minWait = Math.max(1000 - score * 25, 300);
      const randomWait = Math.random() * Math.max(3000 - score * 50, 500);
      const waitTime = minWait + randomWait;
      
      timerRef.current = setTimeout(() => {
        setEntity(Math.random() > 0.25 ? 'MOLE' : 'BOMB');
      }, waitTime);
    } else if (entity === 'MOLE') {
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      
      const reactionTime = Math.max(2000 - score * 45, 600);

      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: 90, duration: 200, useNativeDriver: true }).start(() => {
          setEntity('EMPTY');
          onGameOver("YOU MISSED A MOLE!");
        });
      }, reactionTime);
    } else if (entity === 'BOMB') {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
          Animated.timing(sparkAnim, { toValue: 1, duration: 150, useNativeDriver: true })
        ])
      ).start();

      const bombHideTime = Math.max(1500 - score * 30, 700);

      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: 90, duration: 250, useNativeDriver: true }).start(() => {
          setEntity('EMPTY');
        });
      }, bombHideTime);
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

      if (soundWhack) {
        soundWhack.seekTo(0);
        soundWhack.play();
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setScore((prev) => prev + 1);

      plusOneAnimY.setValue(0);
      plusOneAnimOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(plusOneAnimY, { toValue: -40, duration: 500, useNativeDriver: true }),
        Animated.timing(plusOneAnimOpacity, { toValue: 0, duration: 500, useNativeDriver: true })
      ]).start();

      Animated.timing(slideAnim, { toValue: 90, duration: 150, useNativeDriver: true }).start(() => {
        setEntity('EMPTY');
      });
    } else if (entity === 'BOMB') {
      isTransitioning.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      slideAnim.stopAnimation();

      if (soundBomb) {
        soundBomb.seekTo(0);
        soundBomb.play();
      }
      onGameOver("YOU CLICKED A BOMB!");
    }
  };

  return (
    <Pressable style={styles.holeWrapper} onPress={handleTap}>
      <View style={styles.dirtBase} />
      <View style={styles.holeRim} />
      <View style={styles.holeOpening} />

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
    </Pressable>
  );
}

export default function GameScreen({ score, setScore, onGameOver, soundWhack, soundBomb }) {
  const holes = Array.from({ length: 9 });

  return (
    <View style={styles.fullScreenButton}>
      <Text style={styles.inGameScore}>{score}</Text>
      
      <View style={styles.gridArea}>
        {holes.map((_, index) => (
          <Hole 
            key={index} 
            score={score} 
            setScore={setScore} 
            onGameOver={onGameOver} 
            soundWhack={soundWhack} 
            soundBomb={soundBomb} 
          />
        ))}
      </View>
    </View>
  );
}