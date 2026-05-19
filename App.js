import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error?.message || String(error) };
  }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={styles.errBg} contentContainerStyle={styles.errContent}>
          <Text style={styles.errTitle}>שגיאה — שלח צילום מסך זה לתמיכה</Text>
          <Text style={styles.errMsg}>{this.state.error}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A1628" />
        <HomeScreen />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errBg:      { flex: 1, backgroundColor: '#1a0000' },
  errContent: { padding: 24, paddingTop: 60 },
  errTitle:   { color: '#ff6060', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  errMsg:     { color: '#ffcccc', fontSize: 13, fontFamily: 'monospace' },
});
