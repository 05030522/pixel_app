import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// @react-native-firebase 라이브러리는 google-services.json 파일을 통해
// 자동으로 초기화되므로, 별도의 initializeApp() 코드가 필요 없습니다.

// --- Authentication ---

export const signUp = (
  email: string,
  pass: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  return auth().createUserWithEmailAndPassword(email, pass);
};

export const login = (
  email: string,
  pass: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  return auth().signInWithEmailAndPassword(email, pass);
};

export const logout = (): Promise<void> => {
  return auth().signOut();
};

// --- User Profile ---

export const updateUserProfile = (uid: string, data: object) => {
  return firestore().collection('users').doc(uid).set(data, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const doc = await firestore().collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
};

export const uploadImage = async (
  uri: string,
  path: string,
): Promise<string> => {
  const reference = storage().ref(path);
  await reference.putFile(uri);
  const url = await reference.getDownloadURL();
  return url;
};

// --- Matching (Mock) ---
// 실제 앱에서는 복잡한 매칭 알고리즘이 필요합니다.
export const getDailyMatch = async (currentUserId: string) => {
  // 본인을 제외한 모든 유저를 가져옵니다.
  const usersSnapshot = await firestore()
    .collection('users')
    .where(firestore.FieldPath.documentId(), '!=', currentUserId)
    .limit(1) // 임시로 1명만 가져옵니다.
    .get();

  if (usersSnapshot.empty) {
    return null;
  }
  const matchDoc = usersSnapshot.docs[0];
  return { uid: matchDoc.id, ...matchDoc.data() };
};

// --- Chat ---

const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const listenToMessages = (
  uid1: string,
  uid2: string,
  callback: (messages: any[]) => void,
) => {
  const chatId = getChatId(uid1, uid2);
  return firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
};

export const sendMessage = (uid1: string, uid2: string, message: object) => {
  const chatId = getChatId(uid1, uid2);
  return firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .add({
      ...message,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const getChatData = async (uid1: string, uid2: string) => {
  const chatId = getChatId(uid1, uid2);
  const doc = await firestore().collection('chats').doc(chatId).get();
  return doc.exists ? doc.data() : null;
};

// --- Puzzle Logic ---

export const updatePuzzleOnMessage = async (
  senderId: string,
  receiverId: string,
  messageText: string,
) => {
  const chatId = getChatId(senderId, receiverId);
  const chatRef = firestore().collection('chats').doc(chatId);

  return firestore().runTransaction(async transaction => {
    const chatDoc = await transaction.get(chatRef);

    let {
      revealedPieces = [],
      lastMessageSender = null,
      lastDailyBonus = null,
    } = chatDoc.data() || {};

    const piecesToReveal = new Set<number>();

    // 1. 대화 기반: 메시지를 주고받을 때마다 1개씩 공개
    if (lastMessageSender !== senderId) {
      const unrevealed = Array.from({ length: 36 }, (_, i) => i).filter(
        p => !revealedPieces.includes(p),
      );
      if (unrevealed.length > 0) {
        const randomIndex = Math.floor(Math.random() * unrevealed.length);
        piecesToReveal.add(unrevealed[randomIndex]);
      }
    }

    // 2. 미션 기반: 50자 이상 메시지
    if (messageText.length >= 50) {
      const corePieces = [14, 15, 20, 21]; // 눈, 입 주변 (예시)
      const unrevealedCore = corePieces.filter(
        p => !revealedPieces.includes(p),
      );
      if (unrevealedCore.length > 0) {
        piecesToReveal.add(unrevealedCore[0]);
      }
    }

    // 3. 시간 기반: 매일 첫 접속 시 보너스
    const today = new Date().toISOString().split('T')[0];
    if (lastDailyBonus !== today) {
      const unrevealed = Array.from({ length: 36 }, (_, i) => i).filter(
        p => ![...revealedPieces, ...piecesToReveal].includes(p),
      );
      if (unrevealed.length > 0) {
        const randomIndex = Math.floor(Math.random() * unrevealed.length);
        piecesToReveal.add(unrevealed[randomIndex]);
        transaction.update(chatRef, { lastDailyBonus: today });
      }
    }

    const newRevealedPieces = Array.from(
      new Set([...revealedPieces, ...piecesToReveal]),
    );

    transaction.set(
      chatRef,
      {
        revealedPieces: newRevealedPieces,
        lastMessageSender: senderId,
      },
      { merge: true },
    );
  });
};
