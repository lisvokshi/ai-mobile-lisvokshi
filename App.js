import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Platform,
  Appearance,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from './supabaseClient';

// Force light theme (where supported)
Appearance.setColorScheme('light');

// Shared mood definitions
const moodDefinitions = [
  { mood: 'ecstatic', keywords: ['ecstatic', 'overjoyed', 'elated', 'thrilled', 'euphoric'] },
  { mood: 'happy', keywords: ['happy', 'joy', 'joyful', 'glad', 'delighted', 'content', 'satisfied', 'good', 'cheerful', 'smiling'] },
  { mood: 'excited', keywords: ['excited', 'pumped', 'hyped', 'energized', 'motivated', 'enthusiastic'] },
  { mood: 'calm', keywords: ['calm', 'relaxed', 'chill', 'peaceful', 'at ease'] },
  { mood: 'grateful', keywords: ['grateful', 'thankful', 'appreciative', 'blessed'] },
  { mood: 'proud', keywords: ['proud', 'accomplished', 'achieved', 'successful'] },
  { mood: 'in_love', keywords: ['in love', 'loving', 'affection', 'crush', 'romantic'] },
  { mood: 'hopeful', keywords: ['hopeful', 'optimistic', 'confident about the future'] },
  { mood: 'stressed', keywords: ['stressed', 'under pressure', 'overwhelmed', 'burned out'] },
  { mood: 'anxious', keywords: ['anxious', 'worried', 'nervous', 'tense', 'on edge', 'panic'] },
  { mood: 'angry', keywords: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'pissed'] },
  { mood: 'frustrated', keywords: ['frustrated', 'stuck', 'fed up'] },
  { mood: 'sad', keywords: ['sad', 'down', 'unhappy', 'blue', 'depressed', 'miserable'] },
  { mood: 'lonely', keywords: ['lonely', 'alone', 'isolated'] },
  { mood: 'tired', keywords: ['tired', 'exhausted', 'drained', 'sleepy', 'fatigued'] },
  { mood: 'bored', keywords: ['bored', 'boring', 'nothing to do'] },
  { mood: 'confused', keywords: ['confused', 'lost', "don't understand", 'uncertain'] },
  { mood: 'afraid', keywords: ['afraid', 'scared', 'terrified', 'fearful'] },
];

// Helper: detect all moods present in the text
function detectMoods(note) {
  if (!note) return [];
  const txt = note.toLowerCase();
  const found = [];

  for (const { mood, keywords } of moodDefinitions) {
    if (keywords.some((word) => txt.includes(word))) {
      found.push(mood);
    }
  }

  return found;
}

// Old-style single mood classifier (now we’ll use detectMoods in saveMood)
function getSentiment(note) {
  const moods = detectMoods(note);
  if (moods.length === 0) return 'neutral';
  return moods[0];
}

export default function App() {
  // 🔐 LOGIN STATE
  const [loggedIn, setLoggedIn] = useState(false);
  const [contractNumber, setContractNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 🌤 MOOD JOURNAL STATE
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);

  // =======================
  // LOGIN LOGIC
  // =======================
  const handleLogin = () => {
    const trimmed = contractNumber.trim();
    // RE-#####/YY
    const pattern = /^RE-\d{5}\/\d{2}$/;

    if (!pattern.test(trimmed)) {
      setLoginError('Contract number must look like RE-71904/24');
      return;
    }

    if (!password || password.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    setLoginError('');
    setLoggedIn(true);
  };

  // =======================
  // SUPABASE – LOAD MOODS
  // =======================
  const loadMoods = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('moods')
      .select('id, dt, note, sentiment, user_id')
      .order('dt', { ascending: false });

    if (error) {
      alert('Error loading mood history: ' + error.message);
    } else {
      setMoods(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (loggedIn) {
      loadMoods();
    }
  }, [loggedIn]);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (!selectedDate) return;
    setDate(selectedDate);
  };

  // 💾 Save mood with:
  // - empty note validation
  // - multi-mood validation
  const saveMood = async () => {
    if (!note.trim()) {
      alert('Please write something before saving your mood.');
      return;
    }

    const detected = detectMoods(note);

    if (detected.length > 1) {
      alert(
        'Please describe only one main mood at a time.\nDetected moods: ' +
          detected.join(', ')
      );
      return;
    }

    const sentiment = detected.length === 1 ? detected[0] : 'neutral';

    const { error } = await supabase.from('moods').insert([
      {
        dt: date.toISOString().slice(0, 10),
        note: note,
        sentiment: sentiment,
        user_id: contractNumber,
      },
    ]);

    if (error) {
      alert('Error saving mood: ' + error.message);
    } else {
      alert('Mood saved!');
      setNote('');
      loadMoods();
    }
  };

  const renderMoodItem = ({ item }) => (
    <View style={[styles.moodItem, sentimentStyle(item.sentiment)]}>
      <Text style={styles.moodDate}>
        {item.dt} ({item.user_id})
      </Text>
      <Text style={styles.moodNote}>{item.note}</Text>
      <Text style={styles.moodSentiment}>{item.sentiment}</Text>
    </View>
  );

  // =======================
  // IF NOT LOGGED IN → SHOW LOGIN
  // =======================
  if (!loggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Student Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Contract number (e.g. RE-71904/24)"
          value={contractNumber}
          onChangeText={setContractNumber}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Password (demo only, not real AAB password)"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
          secureTextEntry
        />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <Button title="Log in" onPress={handleLogin} />
      </View>
    );
  }

  // =======================
  // LOGGED IN → SHOW MOOD JOURNAL
  // =======================
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Journal</Text>
      <Text style={styles.loggedInAs}>Logged in as: {contractNumber}</Text>

      <Button title="Pick Date" onPress={() => setShowPicker(true)} />

      <Text style={styles.selectedDate}>
        Selected Date: {date.toISOString().slice(0, 10)}
      </Text>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Write your note..."
        value={note}
        onChangeText={setNote}
        placeholderTextColor="#999"
      />

      <Button title="Save Mood" onPress={saveMood} />

      <Text style={styles.subtitle}>Mood History</Text>

      {loading ? (
        <Text style={styles.text}>Loading...</Text>
      ) : (
        <FlatList
          data={moods}
          keyExtractor={(item) => item.id}
          renderItem={renderMoodItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No moods yet.</Text>
          }
        />
      )}
    </View>
  );
}

// Color style for each mood
function sentimentStyle(sentiment) {
  const base = {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  };

  const colors = {
    ecstatic: '#ffe66d',
    happy: '#d4f8d4',
    excited: '#c3e7ff',
    calm: '#e3f2fd',
    grateful: '#fff3cd',
    proud: '#e0bbff',
    in_love: '#ffd6e7',
    hopeful: '#d1f2eb',
    stressed: '#ffe0b2',
    anxious: '#ffe4e1',
    angry: '#ffcdd2',
    frustrated: '#ffcc80',
    sad: '#f8d4d4',
    lonely: '#e1bee7',
    tired: '#e0e0e0',
    bored: '#f0f4c3',
    confused: '#e6ee9c',
    afraid: '#ffecb3',
    neutral: '#f0f0f0',
  };

  return { ...base, backgroundColor: colors[sentiment] || colors.neutral };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  loggedInAs: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#444',
  },
  selectedDate: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#000',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#000',
  },
  subtitle: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  moodDate: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#000',
  },
  moodNote: {
    marginBottom: 4,
    color: '#000',
  },
  moodSentiment: {
    fontStyle: 'italic',
    color: '#000',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
  },
  text: {
    color: '#000',
  },
  errorText: {
    color: '#c00',
    marginBottom: 10,
    textAlign: 'center',
  },
  moodItem: {
    // base style is in sentimentStyle
  },
});
