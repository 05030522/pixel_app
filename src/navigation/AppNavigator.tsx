import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';

// 타입을 정의합니다.
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Profile: undefined;
  Chat: { matchUserId: string; matchNickname: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// 다크 모드 테마 설정
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#A020F0',
    background: '#121212',
    card: '#1e1e1e',
    text: '#FFFFFF',
    border: '#272727',
    notification: '#A020F0',
  },
};

/**
 * 앱의 화면 흐름을 관리하는 메인 네비게이터입니다.
 * 인증 상태에 따라 다른 화면 스택을 보여줍니다.
 */
const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Firebase 인증 상태 변화를 감지하는 리스너입니다.
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1e1e1e' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          // 로그인 된 사용자
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: '오늘의 매치' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: '프로필 설정' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                title: `${route.params.matchNickname}님과의 대화`,
              })}
            />
          </>
        ) : (
          // 로그인 안된 사용자
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
