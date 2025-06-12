import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';

const numColumns = 8;
const screenWidth = Dimensions.get('window').width;
const itemSize = (screenWidth - 16) / numColumns - 4; // немного адаптивнее с учётом padding

const LobbyGrid = ({ players, currentUserId }) => {
  const data = Array.from({ length: 100 }, (_, i) => {
    const slotId = i + 1;
    const player = players.find(p => p.slot === slotId);
    return {
      slot: slotId,
      nickname: player?.nickname || null,
      userId: player?.id || null,
    };
  });

  const renderItem = ({ item }) => {
    const isCurrentUser = item.slot === currentUserId;


    return (
      <View
        style={[
          styles.slot,
          !item.nickname && styles.emptySlot,
          isCurrentUser && styles.currentUserSlot,
        ]}
      >
        <Text style={styles.slotNumber}>{item.slot}</Text>
        {item.nickname ? (
          <Text style={styles.nickname} numberOfLines={2}>
            {item.nickname}
          </Text>
        ) : (
          <Text style={styles.emptyText}></Text>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.slot.toString()}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      horizontal={false}
      showsVerticalScrollIndicator={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#1c1c1e',
  },
  slot: {
    width: itemSize,
    height: itemSize,
    margin: 2,
    borderRadius: 4,
    backgroundColor: '#2b2b2d',
    borderWidth: 1,
    borderColor: '#3f3f41',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
    elevation: 2,
  },
  currentUserSlot: {
     // Золотой
    borderColor: '#ffef8f',
  },
  emptySlot: {
    backgroundColor: '#3a3a3c',
    borderStyle: 'dashed',
    borderColor: '#666',
  },
  slotNumber: {
    color: '#bbb',
    fontSize: 8,
    marginBottom: 1,
  },
  nickname: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LobbyGrid;
