import { theme } from '@/constants/theme';
import { usePatchApiGoalsByIdMutation, usePostApiGoalsMutation, usePostApiHabitsMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
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
  const inputAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛡️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState(new Date());

  // Goal State
  const [deadline, setDeadline] = useState(new Date());

  const [isCantMiss, setIsCantMiss] = useState(false);
  const [type, setType] = useState<'habit' | 'goal'>(initialType);

  // Layout State for Keyboard Tracking
  const [detailsHeight, setDetailsHeight] = useState(0);

  // UI State
  const nameInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  // Keyboard Listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);

        // Calculate how much we need to move up
        const paddingBottom = Platform.OS === 'ios' ? 40 : 20;
        const gap = 20;
        const contentBelow = detailsHeight + paddingBottom + gap;
        const keyboardHeight = e.endCoordinates.height;

        // Target: Input bottom should be ~12px above keyboard
        const shift = Math.max(0, keyboardHeight + 12 - contentBelow);

        Animated.parallel([
          Animated.timing(inputAnim, {
            toValue: -shift,
            duration: e.duration || 250,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: 1,
            duration: e.duration || 250,
            useNativeDriver: true,
          })
        ]).start();
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        setIsKeyboardVisible(false);

        Animated.parallel([
          Animated.timing(inputAnim, {
            toValue: 0,
            duration: e.duration || 250,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnim, {
            toValue: 0,
            duration: e.duration || 250,
            useNativeDriver: true,
          })
        ]).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [detailsHeight]);

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

      // Reset animations
      inputAnim.setValue(0);
      overlayAnim.setValue(0);

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
      // Reset position when hidden
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
              deadline: deadline.toISOString().split('T')[0],
              status: 'on-track',
              progress: 0,
            }
          }).unwrap();
        }
      }

      handleClose();
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
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={StyleSheet.absoluteFill}
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Handle */}
            <Animated.View
              style={[
                styles.handle,
                { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
              ]}
            />

            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
              ]}
            >
              <Text style={styles.title}>{type === 'habit' ? 'New Habit' : (initialId ? 'Edit Goal' : 'New Goal')}</Text>
              <View style={styles.headerRight}>
                {type === 'goal' && (
                  <TouchableOpacity
                    style={styles.headerCreateButtonContainer}
                    onPress={handleAdd}
                    disabled={!name.trim() || isCreatingGoal || isUpdatingGoal}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={theme.gradients.sage as [string, string]}
                      style={styles.headerCreateButton}
                    >
                      <Text style={styles.headerCreateButtonText}>
                        {isCreatingGoal || isUpdatingGoal ? 'Saving...' : 'Save'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Type Toggle */}
            <View style={{ alignItems: 'center' }}>
              <Animated.View
                style={[
                  styles.typeToggle,
                  { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
                ]}
              >
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
              </Animated.View>
            </View>

            {/* Main Input Row - Animated */}
            <Animated.View
              style={[
                styles.inputRow,
                { transform: [{ translateY: inputAnim }] }
              ]}
            >
              {/* Emoji Input */}
              <View style={styles.emojiContainer}>
                <TextInput
                  style={styles.emojiInput}
                  value={emoji}
                  onChangeText={onEmojiChange}
                  placeholder="✨"
                  placeholderTextColor={theme.colors.textTertiary}
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
                placeholder={type === 'habit' ? 'Enter habit name...' : 'What do you want to achieve?'}
                placeholderTextColor={theme.colors.textTertiary}
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
            </Animated.View>

            {/* Detailed Scheduling View */}
            <Animated.View
              style={[
                styles.detailsContainer,
                { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
              ]}
              onLayout={(e) => setDetailsHeight(e.nativeEvent.layout.height)}
            >
              {type === 'habit' ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>when</Text>
                    <View style={styles.frequencySelector}>
                      <TouchableOpacity
                        style={[styles.freqOption, frequency === 'daily' && styles.freqOptionActive]}
                        onPress={() => setFrequency('daily')}
                      >
                        <LinearGradient
                          colors={frequency === 'daily' ? theme.gradients.sage as [string, string] : [theme.colors.surface, theme.colors.surface]}
                          style={styles.freqOptionGradient}
                        >
                          <Text style={[styles.freqText, frequency === 'daily' && styles.freqTextActive]}>Daily</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>at</Text>
                    <TouchableOpacity
                      style={styles.timePickerButton}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowTimePicker(true);
                      }}
                    >
                      <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.timePickerText}>{formatTime(reminderTime)}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>until</Text>
                    <TouchableOpacity style={styles.endDateButton}>
                      <Text style={styles.endDateText}>End date (optional)</Text>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.calendarContainer}>
                  <DateTimePicker
                    value={deadline}
                    mode="date"
                    display="inline"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    accentColor={theme.colors.primary}
                    style={{ height: 320, width: '100%' }}
                  />
                </View>
              )}

              {type === 'habit' && (
                <TouchableOpacity
                  style={styles.confirmButtonContainer}
                  onPress={handleAdd}
                  disabled={!name.trim() || isCreatingHabit}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={name.trim() ? theme.gradients.sage as [string, string] : [theme.colors.border, theme.colors.border]}
                    style={styles.confirmButton}
                  >
                    <Text style={[styles.confirmButtonText, !name.trim() && styles.confirmButtonTextDisabled]}>
                      {isCreatingHabit ? 'Creating...' : 'Create Habit'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>

        {showTimePicker && (
          <>
            <TouchableOpacity
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay, zIndex: 90 }]}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            />
            <View style={styles.spinnerContainer}>
              <View style={styles.spinnerHeader}>
                <Text style={styles.spinnerTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
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
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 20,
    minHeight: 565,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h2.fontFamily,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCreateButtonContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  headerCreateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerCreateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.md,
  },
  emojiInput: {
    fontSize: 24,
    width: 32,
    height: 32,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    padding: 0,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  schedulePill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  scheduleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    padding: 4,
  },
  typeOption: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 8,
    gap: 16,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    width: 50,
    fontWeight: '500',
  },
  frequencySelector: {
    flex: 1,
  },
  freqOption: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  freqOptionActive: {},
  freqOptionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  freqText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  freqTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  timePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
  },
  timePickerText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  endDateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
  },
  endDateText: {
    color: theme.colors.textTertiary,
    fontSize: 16,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    padding: 8,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    paddingVertical: 20,
    paddingBottom: 40,
    zIndex: 100,
  },
  spinnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  spinnerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  doneText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonContainer: {
    marginTop: 'auto',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  confirmButton: {
    padding: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: theme.colors.textTertiary,
  },
});
