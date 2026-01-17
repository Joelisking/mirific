import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { addMessage, createSession, deleteSession, Message, setActiveSession } from '@/lib/redux/slices/chatSlice';
import { RootState } from '@/lib/redux/store';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

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

  // Redux
  const dispatch = useDispatch();
  const { sessions, activeSessionId } = useSelector((state: RootState) => state.chat);

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const messages = activeSession ? activeSession.messages : [];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Sheet State
  const [showSheet, setShowSheet] = useState(false);
  const [sheetType, setSheetType] = useState<'habit' | 'goal'>('habit');
  const [sheetInitialValues, setSheetInitialValues] = useState<any>(undefined);

  // Initialize new chat if none exists
  useEffect(() => {
    if (!activeSessionId) {
      createNewChat();
    }
  }, [activeSessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      showSubscription.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping, activeSessionId]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const initialMsg: Message = {
      id: 'init-' + newId,
      type: 'ai',
      text: `Hey ${userProfile?.name?.split(' ')[0] || 'there'}! 👋 Ready to tackle something new?\n\nWhat do you want to get done this week?`,
      timestamp: Date.now()
    };
    dispatch(createSession({ id: newId, initialMessage: initialMsg }));
    setShowHistory(false);
  };

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
        timestamp: Date.now()
      };

      if (activeSessionId) {
        dispatch(addMessage({ sessionId: activeSessionId, message: aiMessage }));
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      Alert.alert('Error', 'I had trouble connecting. Please try again.');
      // Add error message to chat locally? Or just toast.
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: Date.now()
    };

    dispatch(addMessage({ sessionId: activeSessionId, message: userMessage }));
    setInputText('');

    // Optimistic update for UI, but rely on Redux for logic
    // New history includes this message
    const newHistory = [...messages, userMessage];
    sendMessageToBackend(text, newHistory);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const formatHistoryDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
    let reminderTime = new Date();
    setSheetInitialValues({
      name: suggestion.name,
      emoji: suggestion.emoji,
      frequency: suggestion.frequency.toLowerCase() as 'daily' | 'weekly',
      reminderTime: reminderTime,
    });
    setShowSheet(true);
  };

  const handleDeleteSession = (id: string, e: any) => {
    e.stopPropagation();
    Alert.alert("Delete Chat", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteSession(id)) }
    ])
  }

  // Sort sessions by last active
  const sortedSessions = Object.values(sessions).sort((a, b) => b.lastMessageAt - a.lastMessageAt);

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
                <Ionicons name="sparkles" size={20} color="#000" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Mirific AI</Text>
              <Text style={styles.headerSubtitle}>Your Personal Coach</Text>
            </View>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowHistory(true)}
            >
              <Ionicons name="time-outline" size={22} color={theme.colors.textPrimary} />
            </TouchableOpacity>
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

              {/* Suggestions Cards (Goal/Habit) */}
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
              {/* Similar block for Habit Suggestion can be kept if needed, omitted for brevity if identical pattern */}
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

          {/* Suggestions: Only show if new chat (<= 1 message which is the initial greeting) */}
          {messages.length <= 1 && !isTyping && (
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

      {/* HISTORY MODAL */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.newChatContainer}>
            <TouchableOpacity style={styles.newChatButton} onPress={createNewChat}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newChatText}>Start New Chat</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.historyList}>
            {sortedSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.historyItem, activeSessionId === session.id && styles.historyItemActive]}
                onPress={() => {
                  dispatch(setActiveSession(session.id));
                  setShowHistory(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{session.title}</Text>
                  <Text style={styles.historyDate}>{formatHistoryDate(session.lastMessageAt)}</Text>
                </View>
                <TouchableOpacity onPress={(e) => handleDeleteSession(session.id, e)} style={{ padding: 8 }}>
                  <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginBottom: 55,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.background, // Seamless header
    borderBottomWidth: 0,
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
    ...theme.shadows.small,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  historyButton: {
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    ...theme.shadows.small,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContent: {
    padding: 24,
    gap: 24, // Wider gap between messages
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
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16, // Sharper
    // No shadow
  },
  messageBubbleUser: {
    backgroundColor: theme.colors.primary, // Indigo
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: theme.colors.surfaceHighlight, // Light Gray
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  messageTextUser: {
    color: '#fff',
  },

  // Goal Proposal Styles
  goalProposalContainer: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
  },
  goalProposalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    ...theme.shadows.medium,
  },
  goalProposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  goalProposalEmoji: {
    fontSize: 28,
  },
  goalProposalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  goalProposalText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    fontFamily: theme.typography.h2.fontFamily,
  },
  goalProposalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalProposalDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  lockInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    ...theme.shadows.small,
  },
  lockInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Habit Proposal Styles
  habitProposalContainer: {
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
  },
  habitProposalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    ...theme.shadows.medium,
  },
  habitProposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  habitProposalEmoji: {
    fontSize: 28,
  },
  habitProposalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success, // Keep green for habits? Or use secondary accent? Let's use accent (Green)
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  habitProposalText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    fontFamily: theme.typography.h2.fontFamily,
  },
  habitProposalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  habitProposalFrequency: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitProposalTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockInHabitButton: {
    backgroundColor: theme.colors.accent, // Green accent
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    ...theme.shadows.small,
  },
  lockInHabitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  suggestionsContainer: {
    gap: 12,
    paddingTop: 16,
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  suggestionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...theme.shadows.small,
  },
  suggestionText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    // marginBottom: 65, // Clear the tab bar
    backgroundColor: theme.colors.background, // Transparent-ish
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row', // Changed from default
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 32, // Pill shape
    padding: 6,
    paddingLeft: 20,
    ...theme.shadows.medium,
    borderWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
  },
  modalClose: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  newChatContainer: {
    marginBottom: 24,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 18,
    borderRadius: 20,
    gap: 8,
    ...theme.shadows.small,
  },
  newChatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: 12,
    ...theme.shadows.small,
    borderWidth: 0,
  },
  historyItemActive: {
    backgroundColor: theme.colors.surfaceElevated,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});

