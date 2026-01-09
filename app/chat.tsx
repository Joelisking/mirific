import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { theme } from "@/constants/theme";

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { userProfile, createCommitment } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: `Hey ${userProfile.name || 'there'}! 👋 Ready to tackle something new?\n\nWhat do you want to get done this week?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    'Launch my portfolio website',
    'Study for my upcoming exam',
    'Build a consistent workout habit',
    'Start my side project',
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setShowSuggestions(false);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: `Love it! "${text}" is a solid goal 💪\n\nWhen would you like to have this done by? I'm thinking we could aim for next week to keep momentum going.`,
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Show commitment button after AI response
      setTimeout(() => {
        const commitmentPrompt: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          text: '✨ Ready to lock this in?',
        };
        setMessages((prev) => [...prev, commitmentPrompt]);
      }, 1000);
    }, 1000);
  };

  const handleLockIn = () => {
    const userGoal = messages.find((m) => m.type === 'user');
    if (userGoal) {
      createCommitment(userGoal.text);
      router.push('/commitment');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <Ionicons name="menu" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.avatar} />
            <Text style={styles.headerTitle}>Your Coach</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/timeline')}
            style={styles.headerButton}
          >
            <Ionicons name="calendar-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
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
          ))}

          {/* Lock In Button */}
          {messages.length >= 4 && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.lockInButton}
                onPress={handleLockIn}
              >
                <Text style={styles.lockInButtonText}>Lock this in 🔒</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
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
            >
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperAI: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  messageBubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 8,
  },
  messageBubbleAI: {
    backgroundColor: theme.colors.surfaceElevated,
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  messageTextUser: {
    color: theme.colors.textPrimary,
  },
  actionContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  lockInButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  lockInButtonText: {
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
    borderWidth: 2,
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
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
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
