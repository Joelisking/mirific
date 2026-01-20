import ChatContextMenu from '@/components/coach/ChatContextMenu';
import ProposalRenderer from '@/components/coach/ProposalRenderer';
import MarkdownText from '@/components/common/MarkdownText';
import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { parseGoalUpdate } from '@/lib/ai';
import { useGetApiGoalsQuery, usePatchApiGoalsByIdMutation } from '@/lib/redux/api/generated';
import { addMessage, createSession, deleteSession, markProposalSaved, setActiveSession, type Message } from '@/lib/redux/slices/chatSlice';
import { RootState } from '@/lib/redux/store';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
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

  // API Hooks
  const { data: activeGoals } = useGetApiGoalsQuery();
  const [updateGoal] = usePatchApiGoalsByIdMutation();

  const dispatch = useDispatch();
  const { sessions, activeSessionId } = useSelector((state: RootState) => state.chat);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const messages = activeSession ? activeSession.messages : [];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [showSheet, setShowSheet] = useState(false);
  const [sheetType, setSheetType] = useState<'habit' | 'goal'>('habit');
  const [sheetInitialValues, setSheetInitialValues] = useState<any>(undefined);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSessionId) {
      createNewChat();
    }
  }, [activeSessionId]);

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
      text: `Hey ${userProfile?.name?.split(' ')[0] || 'there'} ! 👋 Ready to tackle something new?\n\nWhat do you want to get done this week ? `,
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

      const systemContext = {
        role: 'system',
        content: `Current Date: ${new Date().toISOString().split('T')[0]}. Ensure all date suggestions are in the future relative to this date.`
      };

      const response = await fetch(`${getApiBaseUrl()} /api/ai / chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token} `,
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
    } finally {
      setIsTyping(false);
    }
  };

  const handleMessageLongPress = (event: GestureResponderEvent, text: string) => {
    const { pageX, pageY } = event.nativeEvent;
    // Adjust Y to not be under the finger, maybe slightly below or above
    // We'll limit width to stay on screen later in styling
    setContextMenu({
      visible: true,
      x: Math.min(pageX, 200), // Keep it somewhat left-aligned if on right edge
      y: pageY,
      text
    });
  };



  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: Date.now()
    };

    dispatch(addMessage({ sessionId: activeSessionId, message: userMessage }));
    setInputText('');

    // Check for goal progress update
    if (activeGoals && activeGoals.length > 0) {
      const validGoals = activeGoals.map(g => ({
        id: g.id!,
        text: g.text!,
        progress: g.progress || 0
      }));

      try {
        const updateResult = await parseGoalUpdate(text, validGoals);
        if (updateResult) {
          const goal = activeGoals.find(g => g.id === updateResult.goalId);
          if (goal) {
            const aiMessage: Message = {
              id: Date.now().toString(),
              type: 'ai',
              text: `I noticed you made progress on "${goal.text}".Should I update it for you ? `,
              timestamp: Date.now(),
              progressUpdateSuggestion: {
                goalId: goal.id!,
                goalTitle: goal.text!,
                oldProgress: goal.progress || 0,
                newProgress: updateResult.newProgress
              }
            };
            dispatch(addMessage({ sessionId: activeSessionId, message: aiMessage }));
            return; // Skip normal chat response if we handled it as a progress update
          }
        }
      } catch (e) {
        console.log('Error checking progress', e);
      }
    }

    const newHistory = [...messages, userMessage];
    sendMessageToBackend(text, newHistory);
  };

  const handleConfirmProgressUpdate = async (suggestion: NonNullable<Message['progressUpdateSuggestion']>, messageId: string) => {
    try {
      await updateGoal({
        id: suggestion.goalId,
        updateGoalRequest: { progress: suggestion.newProgress }
      }).unwrap();

      if (activeSessionId) {
        dispatch(markProposalSaved({
          sessionId: activeSessionId,
          messageId,
          type: 'goal', // Reusing 'goal' type for simplicity in reducer or define new one if strictly typed
          savedId: suggestion.goalId
        }));
      }
    } catch (e) {
      Alert.alert("Update Failed", "Could not update goal progress.");
    }
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

  const handleCreateGoal = (suggestion: GoalSuggestion, messageId: string) => {
    setSheetType('goal');
    setSheetInitialValues({
      name: suggestion.text,
      emoji: suggestion.emoji,
      deadline: new Date(suggestion.deadline),
    });
    setActiveMessageId(messageId);
    setShowSheet(true);
  };

  const handleCreateHabit = (suggestion: HabitSuggestion, messageId: string) => {
    setSheetType('habit');
    let reminderTime = new Date();
    setSheetInitialValues({
      name: suggestion.name,
      emoji: suggestion.emoji,
      frequency: suggestion.frequency.toLowerCase() as 'daily' | 'weekly',
      reminderTime: reminderTime,
    });
    setActiveMessageId(messageId);
    setShowSheet(true);
  };

  const handleSheetSuccess = () => {
    if (activeSessionId && activeMessageId) {
      dispatch(markProposalSaved({
        sessionId: activeSessionId,
        messageId: activeMessageId,
        type: sheetType,
        savedId: 'temp-id'
      }));
    }
    setActiveMessageId(null);
  };

  const handleDeleteSession = (id: string, e: any) => {
    e.stopPropagation();
    Alert.alert("Delete Chat", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteSession(id)) }
    ])
  }

  const sortedSessions = Object.values(sessions).sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.logoGradient}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </LinearGradient>
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
                {message.type === 'user' ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onLongPress={(e) => handleMessageLongPress(e, message.text)}
                    style={[
                      styles.messageWrapper,
                      styles.messageWrapperUser,
                    ]}
                  >
                    <LinearGradient
                      colors={theme.gradients.sage as [string, string]}
                      style={[styles.messageBubble, styles.messageBubbleUser]}
                    >
                      <MarkdownText style={[styles.messageText, styles.messageTextUser]}>
                        {message.text}
                      </MarkdownText>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.messageWrapper,
                      styles.messageWrapperAI,
                    ]}
                  >
                    <View style={[styles.messageBubble, styles.messageBubbleAI]}>
                      <MarkdownText style={styles.messageText}>
                        {message.text}
                      </MarkdownText>
                    </View>
                  </View>
                )}

                <ProposalRenderer
                  message={message}
                  onCreateGoal={handleCreateGoal}
                  onCreateHabit={handleCreateHabit}
                  onConfirmProgressUpdate={handleConfirmProgressUpdate}
                />
              </View>
            ))}

            {isTyping && (
              <View style={[styles.messageWrapper, styles.messageWrapperAI]}>
                <View style={[styles.messageBubble, styles.messageBubbleAI, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                </View>
              </View>
            )}

            {/* Quick start suggestions */}
            {messages.length <= 1 && !isTyping && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Quick starts</Text>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSendMessage(suggestion)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
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
                placeholder="What's on your mind?"
                placeholderTextColor={theme.colors.textTertiary}
                multiline={true}
                textAlignVertical="center" // Android
              />
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
              >
                <LinearGradient
                  colors={inputText.trim() ? theme.gradients.sage as [string, string] : [theme.colors.border, theme.colors.border]}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={16} color={inputText.trim() ? '#fff' : theme.colors.textTertiary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <AddHabitSheet
          visible={showSheet}
          onClose={() => setShowSheet(false)}
          onAddSafe={handleSheetSuccess}
          initialType={sheetType}
          initialValues={sheetInitialValues}
        />

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowHistory(false)}
        >
          <LinearGradient
            colors={theme.gradients.warmBeige as [string, string]}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.newChatContainer}>
              <TouchableOpacity style={styles.newChatButton} onPress={createNewChat} activeOpacity={0.9}>
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.newChatButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.newChatText}>Start New Chat</Text>
                </LinearGradient>
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
          </LinearGradient>
        </Modal>
      </SafeAreaView>
      {/* Custom Context Menu Modal */}
      <ChatContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        text={contextMenu.text}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
      />
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginBottom: 55,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    borderRadius: 24,
    ...theme.shadows.small,
  },
  logoGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  historyButton: {
    padding: 10,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
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
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: theme.colors.surfaceElevated,
    borderBottomLeftRadius: 4,
    ...theme.shadows.small,
  },
  typingBubble: {
    paddingVertical: 16,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  messageTextUser: {
    color: '#fff',
  },

  suggestionsContainer: {
    gap: 10,
    paddingTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.shadows.small,
  },
  suggestionText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.full,
    padding: 6,
    paddingLeft: 20,
    ...theme.shadows.medium,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
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
    fontWeight: '700',
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
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  newChatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
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
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    ...theme.shadows.small,
  },
  historyItemActive: {
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
