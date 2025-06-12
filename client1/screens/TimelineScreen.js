import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image,TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Divider, ProgressBar } from 'react-native-paper';
import { getProfile, getTimeline } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors'; // Import the color palette

const TimelineScreen = () => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks] = useState(40);
  const [weekData, setWeekData] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      const token = await AsyncStorage.getItem('token');
      const profileRes = await getProfile(token);
      const { last_period_date } = profileRes.data;
      const start = new Date(last_period_date);
      const now = new Date();
      const week = Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
      setCurrentWeek(week);
      const res = await getTimeline(token, week);
      setWeekData(res.data);
    };
    fetchTimeline();
  }, []);

  if (!weekData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading timeline data...</Text>
      </View>
    );
  }

  // Function to navigate to different weeks
  const navigateWeek = (direction) => {
    if (direction === 'prev' && currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    } else if (direction === 'next' && currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  // Calculate trimester
  const getTrimester = (week) => {
    if (week <= 13) return 'First Trimester';
    if (week <= 26) return 'Second Trimester';
    return 'Third Trimester';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.weekText}>Week {currentWeek} of {totalWeeks}</Text>
        <Text style={styles.trimesterText}>{getTrimester(currentWeek)}</Text>
        <ProgressBar progress={currentWeek/totalWeeks} color="#6200ee" style={styles.progressBar} />
      </View>
      
      <View style={styles.weekNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentWeek === 1 && styles.disabledButton]}
          onPress={() => navigateWeek('prev')}
          disabled={currentWeek === 1}
        >
          <Text style={styles.navButtonText}>Previous Week</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentWeek === totalWeeks && styles.disabledButton]}
          onPress={() => navigateWeek('next')}
          disabled={currentWeek === totalWeeks}
        >
          <Text style={styles.navButtonText}>Next Week</Text>
        </TouchableOpacity>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Baby Development</Title>
          <View style={styles.sizeInfo}>
            <View style={styles.sizeTextContainer}>
              <Text style={styles.sizeLabel}>Size:</Text>
              <Text style={styles.sizeValue}>{weekData?.babyDevelopment?.size || 'Information not available'}</Text>
              <Text style={styles.compareText}>
                About the size of a {weekData?.babyDevelopment?.compareTo || 'small object'}
              </Text>
            </View>
            {/* Placeholder for an image */}
            <View style={styles.sizeImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Text>🍠</Text>
              </View>
            </View>
          </View>
          <Divider style={styles.divider} />
          <Paragraph>{weekData?.babyDevelopment?.description || 'Baby development information not available for this week.'}</Paragraph>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Your Body This Week</Title>
          <Text style={styles.subheading}>Physical Changes</Text>
          {weekData.motherChanges.physical.map((change, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{change}</Text>
            </View>
          ))}
          
          <Text style={styles.subheading}>Hormonal Changes</Text>
          {weekData.motherChanges.hormonal.map((change, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{change}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Tips for This Week</Title>
          {weekData.tipsForWeek.map((tip, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{tip}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      {weekData.importantNotes && (
        <Card style={[styles.card, styles.notesCard]}>
          <Card.Content>
            <Title>Important Notes</Title>
            <Paragraph>{weekData.importantNotes}</Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 15,
    backgroundColor: COLORS.cardBg,
  },
  weekText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  trimesterText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryLight,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  navButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  card: {
    margin: 10,
    backgroundColor: COLORS.cardBg,
  },
  sizeInfo: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  sizeTextContainer: {
    flex: 3,
  },
  sizeImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sizeValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  compareText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
    color: COLORS.textSecondary,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 10,
    backgroundColor: COLORS.divider,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: COLORS.textPrimary,
  },
  bulletItem: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  bullet: {
    marginRight: 8,
    fontSize: 16,
    color: COLORS.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  notesCard: {
    backgroundColor: '#FFF9C4',
  },
});

export default TimelineScreen;