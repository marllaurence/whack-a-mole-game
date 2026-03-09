// FILE: components/LoadingScreen.styles.js

import { StyleSheet } from 'react-native';

export const loadingStyles = StyleSheet.create({
  sparkleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  // We are creating small, golden circular particles that pulse
  sparklePoint: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: '#FFD700', // Bright Gold
    borderRadius: 7.5,
    shadowColor: '#FFD700',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  // Define unique positions for each particle
  sparklePoint1: {
    top: 50,
    left: 50,
    width: 15,
    height: 15,
    backgroundColor: '#FFD700', 
    borderRadius: 7.5,
    position: 'absolute',
  },
  sparklePoint2: {
    top: 50,
    right: 50,
    width: 20,
    height: 20,
    backgroundColor: '#FFD700', 
    borderRadius: 10,
    position: 'absolute',
  },
  sparklePoint3: {
    bottom: 50,
    left: 80,
    width: 12,
    height: 12,
    backgroundColor: '#FFD700', 
    borderRadius: 6,
    position: 'absolute',
  },
  sparklePoint4: {
    bottom: 80,
    right: 80,
    width: 18,
    height: 18,
    backgroundColor: '#FFD700', 
    borderRadius: 9,
    position: 'absolute',
  },
});