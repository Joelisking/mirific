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
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
                <Ionicons name="sparkles" size={20} color="#fff" />
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
  historyButton: {
    padding: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 12,
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

  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  modalClose: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  newChatContainer: {
    marginBottom: 20,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 16,
    gap: 8,
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
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  historyItemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceElevated,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  }
});

