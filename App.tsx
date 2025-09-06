import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * 앱의 최상위 컴포넌트입니다.
 * 네비게이터와 상태바, SafeAreaProvider를 설정합니다.
 */
const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
