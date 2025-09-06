import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

/**
 * 앱 전체에서 사용될 공통 입력 상자 컴포넌트입니다.
 */
const InputBox: React.FC<TextInputProps> = props => {
  return (
    <TextInput style={styles.input} placeholderTextColor="#888" {...props} />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
});

export default InputBox;
