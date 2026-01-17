import { theme } from '@/constants/theme';
import { usePostApiHabitsMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddSafe?: () => void; // Optional callback if parent needs to know
}

export default function AddHabitSheet({ visible, onClose }: AddHabitSheetProps) {
  const [createHabit, { isLoading: isCreatingHabit }] = usePostApiHabitsMutation();

  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛡️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [isCantMiss, setIsCantMiss] = useState(false);
  const [type, setType] = useState<'habit' | 'goal'>('habit');

  // UI State
  const nameInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setName('');
      setEmoji('🛡️');
      setFrequency('daily');
      setReminderTime(new Date());
      setReminderTime(new Date());
      setReminderTime(new Date());
      setShowTimePicker(false);
      // Auto-focus logic handled by autoFocus prop or effect? 
      // Let's rely on autoFocus prop for initial open, or imperative focus
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // Android picker is modal, so we don't need to do anything special regarding layout
    }
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleAddHabit = async () => {
    if (!name.trim()) return;

    try {
      await createHabit({
        createHabitRequest: {
          name: name,
          emoji: emoji,
          frequency: frequency,
          reminderTime: formatTime(reminderTime),
        },
      }).unwrap();

      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
      console.error('Failed to create habit:', error);
    }
  };

  const toggleKeyboard = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      nameInputRef.current?.focus();
    }
  };

  const onEmojiChange = (text: string) => {
    const filtered = text.replace(/[a-zA-Z0-9]/g, '');
    if (!filtered) {
      setEmoji('');
      return;
    }
    try {
      // @ts-ignore
      const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
      const segments = [...segmenter.segment(filtered)];
      const lastGrapheme = segments[segments.length - 1].segment;
      setEmoji(lastGrapheme);
    } catch (e) {
      setEmoji(filtered);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Habit</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Main Input Row */}
            <View style={styles.inputRow}>
              {/* Emoji Input */}
              <View style={styles.emojiContainer}>
                <TextInput
                  style={styles.emojiInput}
                  value={emoji}
                  onChangeText={onEmojiChange}
                  placeholder="✨"
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={12}
                  selectTextOnFocus
                />
              </View>

              {/* Name Input */}
              <TextInput
                ref={nameInputRef}
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="habit"
                placeholderTextColor={theme.colors.textSecondary}
              />

              {/* Schedule Summary Pill */}
              <TouchableOpacity onPress={toggleKeyboard} style={styles.schedulePill}>
                <Text style={styles.scheduleText}>
                  {frequency === 'daily' ? 'Daily' : 'Weekly'}, {formatTime(reminderTime)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Controls Row */}
            {/* <View style={styles.controlsRow}>
              Type Toggle
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'habit' && styles.typeOptionActive]}
                  onPress={() => setType('habit')}
                >
                  <Ionicons name="repeat" size={16} color={type === 'habit' ? '#000' : theme.colors.textSecondary} />
                  <Text style={[styles.typeText, type === 'habit' && styles.typeTextActive]}>Habit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'goal' && styles.typeOptionActive]}
                  onPress={() => setType('goal')}
                >
                  <Text style={[styles.typeText, type === 'goal' && styles.typeTextActive]}>Goal</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cantMissToggle}>
                <Ionicons name="notifications" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.cantMissText}>Can't miss?</Text>
              </View>
            </View> */}

            {/* Detailed Scheduling View (Always Rendered) */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>when</Text>
                <View style={styles.frequencySelector}>
                  <TouchableOpacity
                    style={[styles.freqOption, frequency === 'daily' && styles.freqOptionActive]}
                    onPress={() => setFrequency('daily')}
                  >
                    <Text style={[styles.freqText, frequency === 'daily' && styles.freqTextActive]}>Daily</Text>
                  </TouchableOpacity>
                  {/* Simplified for demo, can add Weekly here */}
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>at</Text>
                <TouchableOpacity
                  style={styles.timePickerContainer}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowTimePicker(true);
                  }}
                >
                  {/* Selected time text or simple visual, picker is now at bottom */}
                  <Text style={{ color: 'white', fontSize: 16 }}>{formatTime(reminderTime)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>until</Text>
                <TouchableOpacity style={styles.endDateButton}>
                  <Text style={styles.endDateText}>End date (optional)</Text>
                </TouchableOpacity>
              </View>

              {/* Full width spinner at bottom aligned with request */}


              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddHabit}
                disabled={!name.trim() || isCreatingHabit}
              >
                <Text style={styles.confirmButtonText}>
                  {isCreatingHabit ? 'Creating...' : 'Create Habit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Button logic: if keyboard is open (isExpanded false), user hits 'return' or we can add a button toolbar above keyboard if needed. 
               For now, relying on 'return' key or the user manually expanding to click create. 
               Actually, let's allow 'return' on input to submit.
           */}
          </View>
        </TouchableWithoutFeedback>

        {showTimePicker && (
          <>
            <TouchableOpacity
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 90 }]}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            />
            <View style={styles.spinnerContainer}>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor="white"
                themeVariant="dark"
                style={{ height: 150 }}
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#1C1C1E', // Darker surface matching screenshot
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  emojiContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiInput: {
    fontSize: 24,
    width: 32,
    height: 32,
    textAlign: 'center',
    color: '#fff',
    padding: 0,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    padding: 0,
  },
  schedulePill: {
    backgroundColor: 'transparent',
  },
  scheduleText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    padding: 2,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary, // Periwinkle blue/purple
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  cantMissToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cantMissText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 12,
    gap: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Label on left, control on right? or aligned? 
    // Screenshot shows: Label (left) ..... Control (Right/Stretched)
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    width: 60,
  },
  frequencySelector: {
    flex: 1,
  },
  freqOption: {
    backgroundColor: theme.colors.primary, // Active state from screenshot
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    opacity: 0.8, // Slightly dimmed to match screenshot dark theme vibe?
  },
  freqOptionActive: {
    backgroundColor: '#4E4E85', // Darker purple/blue
  },
  freqText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  freqTextActive: {
    color: '#fff',
  },
  timePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTimeText: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  endDateButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  endDateText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 40,
    zIndex: 100,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  doneText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#5A584E', // brownish from screenshot? Or maybe theme.primary?
    // Checking screenshot 2, button is brownish "Create Habit"
    // Let's use a subtle primary
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
