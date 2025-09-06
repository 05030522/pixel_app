import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  updateUserProfile,
  uploadImage,
  getUserProfile,
} from '../services/firebase';
import auth from '@react-native-firebase/auth';

import InputBox from '../components/InputBox';
import CustomButton from '../components/CustomButton';
// [수정] 올바른 파일 경로로 수정했습니다.
import InterestSelector from '../components/InterestSelector';

// 관심사 데이터 구조
const interestData = {
  스포츠: ['헬스', '러닝', '수영', '축구', '농구', '골프'],
  문화생활: ['영화', '여행', '뮤지컬', '전시회', '콘서트'],
  음악: ['K-POP', '팝송', '클래식', '재즈', '인디'],
  음식: ['맛집탐방', '요리', '베이킹', '커피', '와인'],
  자기계발: ['독서', '외국어', '코딩', '스터디'],
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ProfileScreenRouteProp>();
  const isFromSignUp = route.params?.fromSignUp || false;

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [nicknameError, setNicknameError] = useState('');
  const [bioError, setBioError] = useState('');

  const currentUser = auth().currentUser;

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setNickname(profile.nickname || '');
          setBio(profile.bio || '');
          setAge(profile.age?.toString() || '');
          setInterests(profile.interests || []);
          setImageUri(profile.profileImageUrl || null);
        }
      }
    };
    loadProfile();
  }, [currentUser]);

  const validateNickname = (text: string) => {
    setNickname(text);
    const regex = /^[가-힣]{1,6}$/; // 한글 1~6자
    if (text && !regex.test(text)) {
      setNicknameError('닉네임은 한글로 1~6자까지 입력 가능합니다.');
    } else {
      setNicknameError('');
    }
  };

  const validateBio = (text: string) => {
    setBio(text);
    const regex = /^[a-zA-Z가-힣\s]*$/; // 한글, 영어, 공백만 허용
    if (text && !regex.test(text)) {
      setBioError('자기소개는 한글과 영어만 입력 가능합니다.');
    } else {
      setBioError('');
    }
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // [수정] 모든 문제점을 해결한 최종 저장 로직입니다.
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    if (nicknameError || bioError) {
      Alert.alert('입력 오류', '입력 형식을 다시 확인해주세요.');
      return;
    }
    if (!nickname || !age) {
      Alert.alert('필수 정보 누락', '닉네임과 나이는 필수입니다.');
      return;
    }

    try {
      let profileImageUrl = '';

      if (imageUri && !imageUri.startsWith('http')) {
        const path = `profile_images/${currentUser.uid}.jpg`;
        profileImageUrl = await uploadImage(imageUri, path);
      } else if (imageUri) {
        profileImageUrl = imageUri;
      } else {
        profileImageUrl =
          'https://placehold.co/120x120/A020F0/FFFFFF?text=Pixel';
      }

      await updateUserProfile(currentUser.uid, {
        nickname,
        bio,
        age: parseInt(age, 10),
        interests,
        profileImageUrl,
      });

      Alert.alert('저장 완료', '프로필이 성공적으로 저장되었습니다.');

      if (isFromSignUp) {
        navigation.replace('Home');
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('저장 실패', '프로필 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          프로필 {isFromSignUp ? '생성' : '수정'}
        </Text>

        <TouchableOpacity onPress={selectImage}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require('../assets/placeholder.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.imagePickerText}>프로필 사진 선택</Text>
        </TouchableOpacity>

        <InputBox
          placeholder="닉네임 (한글, 6자 이하)"
          value={nickname}
          onChangeText={validateNickname}
        />
        {nicknameError ? (
          <Text style={styles.errorText}>{nicknameError}</Text>
        ) : null}

        <InputBox
          placeholder="나이"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <InputBox
          placeholder="자기소개 (한글, 영어)"
          value={bio}
          onChangeText={validateBio}
          multiline
        />
        {bioError ? <Text style={styles.errorText}>{bioError}</Text> : null}

        <Text style={styles.interestTitle}>관심사를 선택해주세요</Text>
        <InterestSelector
          data={interestData}
          selectedItems={interests}
          onSelectionChange={setInterests}
        />

        <CustomButton title="프로필 저장" onPress={handleSaveProfile} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#A020F0',
    textAlign: 'center',
    marginBottom: 30,
  },
  interestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    color: '#FF6B6B',
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default ProfileScreen;
