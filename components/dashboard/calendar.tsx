import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function DashboardWeeklyCalendar() {
  const getCurrentMonth = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    const dayNames = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      days.push({
        name: dayNames[i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    return days;
  };
  const weekDays = getWeekDays();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.monthText}>{getCurrentMonth()}</Text>
        </View>
        <Ionicons
          name="calendar-outline"
          size={24}
          color={theme.colors.textPrimary}
        />
      </View>
      <View style={styles.weekDays}>
        {weekDays.map((day, index) => (
          <View
            key={index}
            style={[
              styles.dayCard,
              day.isToday && styles.dayCardToday,
            ]}>
            <Text
              style={[
                styles.dayName,
                day.isToday && styles.dayNameToday,
              ]}>
              {day.name}
            </Text>
            <Text
              style={[
                styles.dayDate,
                day.isToday && styles.dayDateToday,
              ]}>
              {day.date}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default DashboardWeeklyCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  monthText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    fontSize: 14,
    color: 'theme.colors.accent',
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  dayCardToday: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontSize: 8,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayNameToday: {
    color: theme.colors.textPrimary,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayDateToday: {
    color: theme.colors.textPrimary,
  },
});
