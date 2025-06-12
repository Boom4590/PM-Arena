import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function InstructionScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={require('../jpg/chiken.jpg')} style={styles.topImage} />

      <Text style={styles.title}>📌 Правила участия в турнире</Text>

      {/* Section 1 */}
      <View style={[styles.section, styles.sectionRed]}>
        <Text style={styles.sectionTitle}>1. За следующие нарушения — пожизненный бан:</Text>
        <View style={styles.bulletList}>
          <Text style={[styles.text, styles.red]}>• Игра с эмулятора</Text>
          <Text style={[styles.text, styles.red]}>• Использование читов или стороннего ПО</Text>
          <Text style={[styles.text, styles.red]}>• Использование багов (застревание в текстурах и др.)</Text>
          <Text style={[styles.text, styles.yellow]}>• Тиминг (командная игра в SOLO-турнире)</Text>
          <Text style={[styles.text, styles.yellow]}>• Занятие чужого слота в лобби</Text>
          <Text style={[styles.text, styles.yellow]}>• Передача ID и пароля лобби другим</Text>
        </View>
      </View>

      {/* Section 2 */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>2. Если вы заняли не свой слот:</Text>
        <Text style={styles.text}>• Вы будете исключены, но можете вернуться на своё место до начала матча</Text>
      </View>

      {/* Section 3 */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>3. После входа в лобби и занятия слота:</Text>
        <Text style={styles.text}>• Нельзя выходить или менять место</Text>
        <Text style={styles.text}>• Если матч начнётся без вас — билет не возвращается</Text>
      </View>

      {/* Section 4 */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>4. Если не удалось зайти в лобби:</Text>
        <Text style={styles.text}>• Обратитесь в поддержку WhatsApp и объясните ситуацию</Text>
        <Text style={styles.text}>• При подтверждении причины — билет вернётся</Text>
      </View>

      {/* Section 5 */}
      <View style={[styles.section, styles.sectionGray]}>
        <Text style={styles.sectionTitle}>5. Награды:</Text>
        <Text style={styles.text}>• ТОП-10 получают приз</Text>
        <Text style={styles.text}>• Менеджер сам свяжется с вами через WhatsApp по номеру регистрации</Text>
      </View>

      {/* Images with geometric frames */}
      <View style={styles.imageRow}>
        <View style={styles.imageWrapper}>
          <Image source={require('../jpg/profile.png')} style={styles.image} />
        </View>
        <View style={styles.imageWrapper}>
          <Image source={require('../jpg/profile.png')} style={styles.image} />
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Понятно</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    // paddingTop: 30, // Убираем верхний паддинг, чтобы картинка была у самого верха
    flex: 1,
  },
  topImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderRadius: 0,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    borderLeftWidth: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: '#fafafa',
  },
  sectionRed: {
    borderLeftColor: '#d32f2f',
    backgroundColor: '#ffe6e6',
  },
  sectionGray: {
    borderLeftColor: '#999',
    backgroundColor: '#f7f7f7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
  },
  bulletList: {
    paddingLeft: 8,
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginVertical: 4,
  },
  red: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  yellow: {
    color: '#fbc02d',
    fontWeight: '700',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 3,
    borderColor: '#DAA520',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DAA520',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#DAA520',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 40,
    shadowColor: '#b8860b',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
