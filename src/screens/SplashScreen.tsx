import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * 앱 초기 로딩 시 보여주는 스플래시 화면입니다.
 */
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PixelApp</Text>
      <ActivityIndicator size="large" color="#A020F0" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
});

export default SplashScreen;
