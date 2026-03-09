import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, Pressable, Text, Vibration, View } from 'react-native';
import GameScreen from '../../components/GameScreen';
import { styles } from '../../components/index.styles';
import SplashScreen from '../../components/SplashScreen';

export default function App() {
  const [gameState, setGameState] = useState('LOADING');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);

  const bgmPlayer = useAudioPlayer(require('../../assets/sounds/bgm.mp3'));
  const goPlayer = useAudioPlayer(require('../../assets/sounds/gameover.mp3'));
  const whackPlayer = useAudioPlayer(require('../../assets/sounds/whack.mp3'));
  const bombPlayer = useAudioPlayer(require('../../assets/sounds/explosion.mp3'));

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function configureAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
      } catch (e) {}
    }
    configureAudio();
  }, []);

  useEffect(() => {
    if (bgmPlayer) {
      bgmPlayer.loop = true;
    }
  }, [bgmPlayer]);

  useEffect(() => {
    if (bgmPlayer) {
      if (isBgmEnabled && (gameState === 'START' || gameState === 'PLAYING')) {
        bgmPlayer.play();
      } else {
        bgmPlayer.pause();
      }
    }
  }, [gameState, isBgmEnabled, bgmPlayer]);

  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const storedScore = await AsyncStorage.getItem('@high_score');
        if (storedScore !== null) {
          setHighScore(parseInt(storedScore, 10));
        }
      } catch (e) {}
    };
    
    if (gameState === 'LOADING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -20,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();

      loadHighScore().then(() => {
        setTimeout(() => {
          setGameState('START');
        }, 3000); 
      });
    }
  }, []); 

  const saveHighScore = async (newScore) => {
    try {
      await AsyncStorage.setItem('@high_score', newScore.toString());
      setHighScore(newScore);
    } catch (e) {}
  };

  const startGame = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  const gameOver = () => {
    Vibration.vibrate(500);
    if (goPlayer) {
      goPlayer.seekTo(0);
      goPlayer.play();
    }
    if (score > highScore) {
      saveHighScore(score);
    }
    setGameState('GAMEOVER');
  };

  const toggleBgm = () => {
    setIsBgmEnabled((prev) => !prev);
  };

  const renderMusicToggle = () => {
    if (gameState === 'LOADING') return null;
    return (
      <Pressable style={styles.musicToggle} onPress={toggleBgm}>
        <Text style={styles.musicToggleText}>
          {isBgmEnabled ? '🎵 ON' : '🎵 OFF'}
        </Text>
      </Pressable>
    );
  };

  if (gameState === 'LOADING') {
    return (
      <ImageBackground
        source={require('../../assets/images/orig.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.fullScreenButton}>
          <View style={styles.loadingContainer}>
            <Animated.View style={[
              styles.sprout, 
              { transform: [{ translateY: bounceAnim }] }
            ]} />
            <View style={styles.dirtMound} />
          </View>
          
          <Animated.Text style={[styles.loadingText, { opacity: pulseAnim }]}>
            DIGGING HOLES...
          </Animated.Text>
        </View>
      </ImageBackground>
    );
  }

  if (gameState === 'START') {
    return (
      <ImageBackground
        source={require('../../assets/images/background 1.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {renderMusicToggle()}
        <SplashScreen onStart={startGame} highScore={highScore} />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background 2.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {renderMusicToggle()}
      
      {gameState === 'PLAYING' && (
        <GameScreen 
          score={score} 
          setScore={setScore} 
          onGameOver={gameOver} 
          soundWhack={whackPlayer}
          soundBomb={bombPlayer}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <Pressable style={styles.fullScreenButton} onPress={startGame}>
          <Text style={styles.gameOverTitle}>GAME OVER</Text>
          
          <View style={styles.finalScoreBoard}>
            <Text style={styles.finalScoreLabel}>FINAL SCORE</Text>
            <Text style={styles.finalScoreNumber}>{score}</Text>
          </View>

          <View style={styles.highScoreBoard}>
            <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
            <Text style={styles.highScoreNumber}>{highScore}</Text>
          </View>

          <Text style={styles.subtitle}>Tap to Restart</Text>
        </Pressable>
      )}
    </ImageBackground>
  );
}