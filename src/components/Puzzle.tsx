import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

interface PuzzleProps {
  imageUrl: string;
  revealedPieces: number[];
}

const GRID_SIZE = 6;
const { width } = Dimensions.get('window');
const PUZZLE_CONTAINER_WIDTH = width * 0.9;
const PIECE_SIZE = PUZZLE_CONTAINER_WIDTH / GRID_SIZE;

/**
 * 6x6 그리드 형태의 퍼즐 컴포넌트입니다.
 * 이미지 URL과 공개된 조각 인덱스 배열을 props로 받습니다.
 */
const Puzzle: React.FC<PuzzleProps> = ({ imageUrl, revealedPieces }) => {
  const renderPieces = () => {
    return Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
      const isRevealed = revealedPieces.includes(index);
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;

      if (!isRevealed) {
        return <View key={index} style={styles.hiddenPiece} />;
      }

      // 공개된 조각의 이미지 위치를 계산합니다.
      const imageStyle = {
        position: 'absolute' as 'absolute',
        left: -col * PIECE_SIZE,
        top: -row * PIECE_SIZE,
        width: PUZZLE_CONTAINER_WIDTH,
        height: PUZZLE_CONTAINER_WIDTH,
      };

      return (
        <View key={index} style={styles.revealedPieceContainer}>
          <Image source={{ uri: imageUrl }} style={imageStyle} />
        </View>
      );
    });
  };

  return <View style={styles.container}>{renderPieces()}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: PUZZLE_CONTAINER_WIDTH,
    height: PUZZLE_CONTAINER_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#333',
  },
  hiddenPiece: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    backgroundColor: '#1e1e1e',
    borderWidth: 0.5,
    borderColor: '#444',
  },
  revealedPieceContainer: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    overflow: 'hidden',
  },
});

export default Puzzle;
