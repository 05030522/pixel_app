import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  listenToMessages,
  sendMessage,
  updatePuzzleOnMessage,
} from '../services/firebase';
import auth from '@react-native-firebase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

/**
 * 매칭된 상대와 1:1 대화를 나누는 화면입니다.
 */
const ChatScreen = ({ route }: Props) => {
  const { matchUserId } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = listenToMessages(
      currentUser.uid,
      matchUserId,
      newMessages => {
        setMessages(
          newMessages.map(msg => ({
            _id: msg.id,
            text: msg.text,
            createdAt: msg.createdAt.toDate(),
            user: {
              _id: msg.senderId,
              name: 'User', // 닉네임 표시 가능
            },
          })),
        );
      },
    );

    return () => unsubscribe();
  }, [currentUser, matchUserId]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!currentUser) return;

      const text = newMessages[0].text;
      try {
        const messageData = {
          text,
          senderId: currentUser.uid,
          receiverId: matchUserId,
        };
        await sendMessage(currentUser.uid, matchUserId, messageData);
        // 메시지 전송 후 퍼즐 조각 업데이트 로직 실행
        await updatePuzzleOnMessage(currentUser.uid, matchUserId, text);
      } catch (error) {
        Alert.alert('오류', '메시지 전송에 실패했습니다.');
      }
    },
    [currentUser, matchUserId],
  );

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: currentUser.uid,
        }}
        messagesContainerStyle={styles.messagesContainer}
        // GiftedChat UI 커스터마이징 (다크모드)
        textInputStyle={styles.textInput}
      />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messagesContainer: {
    backgroundColor: '#121212',
  },
  textInput: {
    backgroundColor: '#1e1e1e',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 10,
  },
});

export default ChatScreen;
