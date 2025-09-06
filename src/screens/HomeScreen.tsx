import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomButton from '../components/CustomButton';
import Puzzle from '../components/Puzzle';
import {
  getUserProfile,
  getDailyMatch,
  getChatData,
} from '../services/firebase';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// 사용자 프로필 타입 정의
interface UserProfile {
  uid: string;
  nickname: string;
  age: number;
  bio: string;
  interests: string[];
  profilePictureUrl: string;
}

/**
 * 오늘의 매칭된 상대를 보여주는 홈 화면입니다.
 */
const HomeScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<UserProfile | null>(null);
  const [revealedPieces, setRevealedPieces] = useState<number[]>([]);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        // 1. 자신의 프로필이 있는지 확인
        const userProfile = await getUserProfile(currentUser.uid);
        if (!userProfile) {
          navigation.replace('Profile'); // 프로필이 없으면 생성 화면으로 이동
          return;
        }

        // 2. 오늘의 매치 상대 가져오기 (mock)
        const dailyMatch = await getDailyMatch(currentUser.uid);
        setMatch(dailyMatch);

        if (dailyMatch) {
          // 3. 채팅방 데이터에서 퍼즐 정보 가져오기
          const chatData = await getChatData(currentUser.uid, dailyMatch.uid);
          if (chatData && chatData.revealedPieces) {
            setRevealedPieces(chatData.revealedPieces);
          }
        }
      } catch (error: any) {
        Alert.alert('오류', '매칭 정보를 가져오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#A020F0" />
        <Text style={styles.loadingText}>오늘의 상대를 찾고 있어요...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>오늘의 매칭 상대가 없습니다.</Text>
        <Text style={styles.infoText}>내일 다시 확인해주세요!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.puzzleContainer}>
        <Puzzle
          imageUrl={match.profilePictureUrl}
          revealedPieces={revealedPieces}
        />
      </View>
      <View style={styles.profileContainer}>
        <Text style={styles.nickname}>
          {match.nickname}, {match.age}
        </Text>
        <Text style={styles.bio}>{match.bio}</Text>
        <View style={styles.tagsContainer}>
          {match.interests.map((interest, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      <CustomButton
        title="대화 시작하기"
        onPress={() =>
          navigation.navigate('Chat', {
            matchUserId: match.uid,
            matchNickname: match.nickname,
          })
        }
        style={{ margin: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  puzzleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1e1e1e',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bio: {
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 10,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#333333',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: '#FFFFFF',
  },
});

export default HomeScreen;
