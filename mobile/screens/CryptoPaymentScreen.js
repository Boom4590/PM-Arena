import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function CryptoPaymentScreen({ route }) {
  const { invoiceUrl } = route.params;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: invoiceUrl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
