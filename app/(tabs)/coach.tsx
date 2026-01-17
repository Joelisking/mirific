import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GoalSuggestion {
  text: string;
  deadline: string;
  emoji: string;
}

interface HabitSuggestion {
  name: string;
  emoji: string;
  frequency: string;
  reminderTime: string;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  goalSuggestion?: GoalSuggestion;
  habitSuggestion?: HabitSuggestion;
}

// Helper for API URL
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
    return 'http://192.168.86.29:3001';
  }
  return 'https://your-production-api.com';
};

export default function ChatScreen() {
  const router = useRouter();
  const { userProfile } = useApp();
  const { getToken } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: `Hey ${userProfile.name || 'there'}! 👋 Ready to tackle something new?\n\nWhat do you want to get done this week?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Sheet State
  const [showSheet, setShowSheet] = useState(false);
  const [sheetType, setSheetType] = useState<'habit' | 'goal'>('habit');
  const [sheetInitialValues, setSheetInitialValues] = useState<any>(undefined);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const suggestions = [
    'Launch my portfolio website',
    'Study for my upcoming exam',
    'Build a consistent workout habit',
    'Start my side project',
  ];

  const sendMessageToBackend = async (text: string, currentHistory: Message[]) => {
    try {
      setIsTyping(true);
      const token = await getToken();

      const historyContext = currentHistory.map(m => ({
        role: m.type === 'ai' ? 'assistant' : 'user',
        content: m.text
      })).slice(-6);

      // Inject system context with date
      const systemContext = {
        role: 'system',
        content: `Current Date: ${new Date().toISOString().split('T')[0]}. Ensure all date suggestions are in the future relative to this date.`
      };

      const response = await fetch(`${getApiBaseUrl()}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          context: [systemContext, ...historyContext]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        text: data.message,
        goalSuggestion: data.goalSuggestion,
        habitSuggestion: data.habitSuggestion,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      Alert.alert('Error', 'I had trouble connecting. Please try again.');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        text: "Sorry, I'm having trouble connecting right now. 😔 Can we try again?",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setShowSuggestions(false);

    sendMessageToBackend(text, newHistory);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      const suffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };

      return `${day}${suffix(day)} ${month}, ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const handleCreateGoal = (suggestion: GoalSuggestion) => {
    setSheetType('goal');
    setSheetInitialValues({
      name: suggestion.text,
      emoji: suggestion.emoji,
      deadline: new Date(suggestion.deadline),
    });
    setShowSheet(true);
  };

  const handleCreateHabit = (suggestion: HabitSuggestion) => {
    setSheetType('habit');
    // Basic date parsing logic if needed, or default to now
    let reminderTime = new Date();
    // In a real app we'd parse "8:00 AM" etc.

    setSheetInitialValues({
      name: suggestion.name,
      emoji: suggestion.emoji,
      frequency: suggestion.frequency.toLowerCase() as 'daily' | 'weekly',
      reminderTime: reminderTime,
    });
    setShowSheet(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGradient}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
            </View>
            <View>
              <Text style={styles.headerTitle}>Mirific AI</Text>
              <Text style={styles.headerSubtitle}>Your Personal Coach</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View key={message.id}>
              <View
                style={[
                  styles.messageWrapper,
                  message.type === 'user'
                    ? styles.messageWrapperUser
                    : styles.messageWrapperAI,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    message.type === 'user'
                      ? styles.messageBubbleUser
                      : styles.messageBubbleAI,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.type === 'user' && styles.messageTextUser,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>

              {/* Goal Suggestion Card */}
              {message.goalSuggestion && (
                <View style={styles.goalProposalContainer}>
                  <View style={styles.goalProposalCard}>
                    <View style={styles.goalProposalHeader}>
                      <Text style={styles.goalProposalEmoji}>{message.goalSuggestion.emoji}</Text>
                      <Text style={styles.goalProposalTitle}>Goal Proposal</Text>
                    </View>
                    <Text style={styles.goalProposalText}>{message.goalSuggestion.text}</Text>
                    <View style={styles.goalProposalMeta}>
                      <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.goalProposalDate}>Target: {formatDate(message.goalSuggestion.deadline)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.lockInButton}
                      onPress={() => handleCreateGoal(message.goalSuggestion!)}
                    >
                      <Text style={styles.lockInButtonText}>Review & Save ⚡️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Habit Suggestion Card */}
              {message.habitSuggestion && (
                <View style={styles.habitProposalContainer}>
                  <View style={styles.habitProposalCard}>
                    <View style={styles.habitProposalHeader}>
                      <Text style={styles.habitProposalEmoji}>{message.habitSuggestion.emoji}</Text>
                      <Text style={styles.habitProposalTitle}>Habit Proposal</Text>
                    </View>
                    <Text style={styles.habitProposalText}>{message.habitSuggestion.name}</Text>
                    <View style={styles.habitProposalMeta}>
                      <Ionicons name="repeat-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.habitProposalFrequency}>{message.habitSuggestion.frequency}</Text>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                      <Text style={styles.habitProposalTime}>{message.habitSuggestion.reminderTime}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.lockInHabitButton}
                      onPress={() => handleCreateHabit(message.habitSuggestion!)}
                    >
                      <Text style={styles.lockInHabitButtonText}>Review & Save ⚡️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.messageWrapperAI]}>
              <View style={[styles.messageBubble, styles.messageBubbleAI, { paddingVertical: 16 }]}>
                <ActivityIndicator size="small" color={theme.colors.textSecondary} />
              </View>
            </View>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && !isTyping && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Quick starts:</Text>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSendMessage(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your goal..."
              placeholderTextColor={theme.colors.textSecondary}
              onSubmitEditing={() => handleSendMessage(inputText)}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AddHabitSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        initialType={sheetType}
        initialValues={sheetInitialValues}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperAI: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: theme.colors.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  messageTextUser: {
    color: theme.colors.textPrimary,
  },

  // Goal Proposal Styles
  goalProposalContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  goalProposalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: 20,
    width: '85%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  goalProposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  goalProposalEmoji: {
    fontSize: 24,
  },
  goalProposalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalProposalText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goalProposalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  goalProposalDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  lockInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  lockInButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Habit Proposal Styles
  habitProposalContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  habitProposalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.success,
    padding: 20,
    width: '85%',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  habitProposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  habitProposalEmoji: {
    fontSize: 24,
  },
  habitProposalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  habitProposalText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  habitProposalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  habitProposalFrequency: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  habitProposalTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  lockInHabitButton: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  lockInHabitButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  suggestionsContainer: {
    gap: 8,
    paddingTop: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    paddingHorizontal: 8,
  },
  suggestionButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 24,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
