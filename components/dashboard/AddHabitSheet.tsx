import { theme } from '@/constants/theme';
import { usePatchApiGoalsByIdMutation, usePostApiGoalsMutation, usePostApiHabitsMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface AddHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  onAddSafe?: () => void;
  initialType?: 'habit' | 'goal';
  initialId?: string;
  initialValues?: {
    name?: string;
    emoji?: string;
    frequency?: 'daily' | 'weekly';
    reminderTime?: Date;
    deadline?: Date;
  };
}

export default function AddHabitSheet({ visible, onClose, initialType = 'habit', initialId, initialValues }: AddHabitSheetProps) {
  const [createHabit, { isLoading: isCreatingHabit }] = usePostApiHabitsMutation();
  const [createGoal, { isLoading: isCreatingGoal }] = usePostApiGoalsMutation();
  const [updateGoal, { isLoading: isUpdatingGoal }] = usePatchApiGoalsByIdMutation();

  // Animation State
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛡️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState(new Date());

  // Goal State
  const [deadline, setDeadline] = useState(new Date());

  const [isCantMiss, setIsCantMiss] = useState(false);
  const [type, setType] = useState<'habit' | 'goal'>(initialType);

  // UI State
  const nameInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Animation Logic
  useEffect(() => {
    if (visible) {
      // Reset state and type
      setName(initialValues?.name || '');
      setEmoji(initialValues?.emoji || '🛡️');
      setFrequency(initialValues?.frequency || 'daily');
      setReminderTime(initialValues?.reminderTime || new Date());
      setDeadline(initialValues?.deadline || new Date());
      setShowTimePicker(false);
      setShowDeadlinePicker(false);
      setType(initialType);

      // Animate In
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();

      setTimeout(() => nameInputRef.current?.focus(), 100);
    } else {
      // Reset position when hidden (though Modal unmounts, good practice)
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, initialType, initialValues]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      // Android picker is modal
    }
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDeadlinePicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;

    try {
      if (type === 'habit') {
        // TODO: Add Update Habit logic here if needed later
        await createHabit({
          createHabitRequest: {
            name: name,
            emoji: emoji,
            frequency: frequency,
            reminderTime: formatTime(reminderTime),
          },
        }).unwrap();
      } else {
        if (initialId) {
          await updateGoal({
            id: initialId,
            updateGoalRequest: {
              text: name,
              deadline: deadline.toISOString().split('T')[0],
            }
          }).unwrap();
        } else {
          await createGoal({
            createGoalRequest: {
              text: name,
              deadline: deadline.toISOString().split('T')[0], // YYYY-MM-DD
              status: 'on-track',
              progress: 0,
              // Assuming default progress 0 and status on-track
            }
          }).unwrap();
        }
      }

      handleClose(); // Use animated close
    } catch (error) {
      Alert.alert('Error', `Failed to ${initialId ? 'update' : 'create'} ${type}. Please try again.`);
      console.error(`Failed to ${initialId ? 'update' : 'create'} ${type}:`, error);
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
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={styles.overlay}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={StyleSheet.absoluteFill}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{type === 'habit' ? 'New Habit' : 'New Goal'}</Text>
              <View style={styles.headerRight}>
                {type === 'goal' && (
                  <TouchableOpacity
                    style={styles.headerCreateButton}
                    onPress={handleAdd}
                    disabled={!name.trim() || isCreatingGoal}
                  >
                    <Text style={styles.headerCreateButtonText}>
                      {isCreatingGoal ? 'Creating...' : 'Create'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Type Toggle */}
            <View style={{ alignItems: 'center' }}>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'habit' && styles.typeOptionActive]}
                  onPress={() => setType('habit')}
                >
                  <Text style={[styles.typeText, type === 'habit' && styles.typeTextActive]}>Habit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, type === 'goal' && styles.typeOptionActive]}
                  onPress={() => setType('goal')}
                >
                  <Text style={[styles.typeText, type === 'goal' && styles.typeTextActive]}>Goal</Text>
                </TouchableOpacity>
              </View>
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
                  {type === 'habit'
                    ? `${frequency === 'daily' ? 'Daily' : 'Weekly'}, ${formatTime(reminderTime)}`
                    : `By ${formatDate(deadline)}`
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Detailed Scheduling View (Always Rendered) */}
            <View style={styles.detailsContainer}>
              {type === 'habit' ? (
                <>
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
                </>
              ) : (
                <View style={{ flex: 1 }}>
                  <DateTimePicker
                    value={deadline}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    textColor="white"
                    themeVariant="dark"
                    style={{ height: 320, width: '100%' }}
                  />
                </View>
              )}

              {type === 'habit' && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAdd}
                  disabled={!name.trim() || isCreatingHabit}
                >
                  <Text style={styles.confirmButtonText}>
                    {isCreatingHabit ? 'Creating...' : 'Create Habit'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Add Button logic: if keyboard is open (isExpanded false), user hits 'return' or we can add a button toolbar above keyboard if needed. 
               For now, relying on 'return' key or the user manually expanding to click create. 
               Actually, let's allow 'return' on input to submit.
           */}
          </Animated.View>
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
                style={{ height: 180 }}
              />
            </View>
          </>
        )}


      </View>
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
    minHeight: 565, // Ensure height stays consistent so keyboard doesn't cover input and fits calendar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#c9c9c9ff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCreateButton: {
    backgroundColor: '#5A584E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  headerCreateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
    marginTop: 12,
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
    marginTop: 8,
    gap: 24,
    flex: 1,
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
    marginTop: 'auto',
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
