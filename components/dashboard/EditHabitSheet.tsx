import { theme } from '@/constants/theme';
import {
  useDeleteApiHabitsByIdMutation,
} from '@/lib/redux';
import { usePutApiHabitsByIdMutation } from '@/lib/redux/api/generated';
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

interface EditHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  habit: {
    id: string;
    name: string;
    emoji: string;
    frequency: 'daily' | 'weekly';
    reminderTime?: string | null;
    streak?: number;
  } | null;
}

export default function EditHabitSheet({ visible, onClose, habit }: EditHabitSheetProps) {
  const [deleteHabit, { isLoading: isDeleting }] = useDeleteApiHabitsByIdMutation();
  const [updateHabit, { isLoading: isUpdating }] = usePutApiHabitsByIdMutation();

  // Animation State
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Form State
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛡️');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState(new Date());

  // Layout State for Keyboard Tracking
  const [detailsHeight, setDetailsHeight] = useState(0);

  // UI State
  const nameInputRef = useRef<TextInput>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Keyboard Listeners
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        // Calculate how much we need to move up
        // Content Below Input = detailsHeight + paddingBottom (20/40)
        // If Keyboard Height > Content Below, we must shift up diff + padding

        const paddingBottom = Platform.OS === 'ios' ? 40 : 20;
        const gap = 20;
        const contentBelow = detailsHeight + paddingBottom + gap;
        const keyboardHeight = e.endCoordinates.height;

        // Target: Input bottom should be ~10px above keyboard
        // Current Input Bottom is 'contentBelow' pixels from bottom of screen (since sheet is at bottom)
        // Shift = KeyboardHeight + 10 - contentBelow

        // Only shift if keyboard covers it
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
          }),
        ]).start();
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
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
          }),
        ]).start();
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [detailsHeight]);

  // Animation Logic
  useEffect(() => {
    if (visible && habit) {
      // Set initial values from habit
      setName(habit.name || '');
      setEmoji(habit.emoji || '🛡️');
      setFrequency(habit.frequency || 'daily');
      if (habit.reminderTime) {
        try {
          const today = new Date();
          const timeString = `${today.toDateString()} ${habit.reminderTime}`;
          const time = new Date(timeString);
          if (!isNaN(time.getTime())) {
            setReminderTime(time);
          } else {
            setReminderTime(new Date());
          }
        } catch (e) {
          console.warn('Error parsing time:', e);
          setReminderTime(new Date());
        }
      } else {
        setReminderTime(new Date());
      }
      setShowTimePicker(false);
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
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible, habit]);

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

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !habit) return;

    try {
      await updateHabit({
        id: habit.id,
        updateHabitRequest: {
          name: name,
          emoji: emoji,
          frequency: frequency,
          reminderTime: formatTime(reminderTime),
        },
      }).unwrap();

      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit. Please try again.');
      console.error('Failed to update habit:', error);
    }
  };

  const handleDelete = () => {
    if (!habit) return;

    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This will reset your streak.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit({ id: habit.id }).unwrap();
              handleClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
              console.error('Failed to delete habit:', error);
            }
          },
        },
      ]
    );
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

  const isSaving = isDeleting || isUpdating;

  if (!habit) return null;

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
              <Text style={styles.title}>Edit Habit</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Streak Badge */}
            {habit.streak && habit.streak > 0 && (
              <Animated.View
                style={[
                  styles.streakBadge,
                  { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
                ]}
              >
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{habit.streak} day streak</Text>
              </Animated.View>
            )}

            {/* Main Input Row - Animated (Stays Opaque) */}
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
                placeholder="Enter habit name..."
                placeholderTextColor={theme.colors.textTertiary}
              />
            </Animated.View>

            {/* Detailed Scheduling View */}
            <Animated.View
              style={[
                styles.detailsContainer,
                { opacity: overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }
              ]}
              onLayout={(e) => setDetailsHeight(e.nativeEvent.layout.height)}
            >
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

              {/* Save Button */}
              <TouchableOpacity
                style={styles.confirmButtonContainer}
                onPress={handleSave}
                disabled={!name.trim() || isSaving}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={name.trim() && !isSaving ? theme.gradients.sage as [string, string] : [theme.colors.border, theme.colors.border]}
                  style={styles.confirmButton}
                >
                  <Text style={[styles.confirmButtonText, (!name.trim() || isSaving) && styles.confirmButtonTextDisabled]}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
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
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(217, 115, 115, 0.1)',
    borderRadius: theme.borderRadius.md,
  },
  closeButton: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(232, 167, 86, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.streakGlow,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  detailsContainer: {
    gap: 16,
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
    marginTop: 8,
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
