import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfile, getTimeline } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors'; // Import the color palette

const HomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const profileRes = await getProfile(token);
        setProfile(profileRes.data);

        const { last_period_date } = profileRes.data;
        if (last_period_date) {
          const start = new Date(last_period_date);
          const now = new Date();
          const week = Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
          setCurrentWeek(week);
          const timelineRes = await getTimeline(token, week);
          setWeekData(timelineRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  if (!profile || !weekData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  // Calculate trimester
  const getTrimester = (week) => {
    if (week <= 13) return 'First Trimester';
    if (week <= 26) return 'Second Trimester';
    return 'Third Trimester';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.greeting}>Hello, {profile.name}!</Text>
        
        <View style={styles.weekBadge}>
          <Text style={styles.weekBadgeText}>Week {currentWeek}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Icon name="calendar-clock" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.infoCardTitle}>{getTrimester(currentWeek)}</Text>
            <Text style={styles.infoCardText}>
              {profile.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Update Card */}
      <Text style={styles.sectionTitle}>Your Pregnancy This Week</Text>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Icon name="baby-face-outline" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Baby Development</Title>
          </View>
          <View style={styles.babyInfoRow}>
            <View style={styles.babyImagePlaceholder}>
              <Text style={styles.babyImageEmoji}>👶</Text>
            </View>
            <View style={styles.babyInfoContent}>
              <Text style={styles.babyInfoHighlight}>Size: {weekData.babyDevelopment.size}</Text>
              <Text style={styles.babyInfoCompare}>
                About the size of a {weekData.babyDevelopment.compareTo || 'small fruit'}
              </Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <Paragraph style={styles.developmentText}>{weekData.babyDevelopment.description}</Paragraph>
          
          <View style={styles.cardHeader}>
            <Icon name="human-pregnant" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Your Body</Title>
          </View>
          <View style={styles.bodyChanges}>
            {weekData.motherChanges?.physical && weekData.motherChanges.physical.length > 0 ? (
              weekData.motherChanges.physical.slice(0, 3).map((change, index) => (
                <View key={index} style={styles.changeItem}>
                  <Icon name="circle-small" size={22} color={COLORS.primary} />
                  <Text style={styles.changeText}>{change}</Text>
                </View>
              ))
            ) : (
              <Text>No physical changes recorded for this week.</Text>
            )}
            {weekData.motherChanges?.physical && weekData.motherChanges.physical.length > 3 && (
              <TouchableOpacity 
                style={styles.seeMoreButton}
                onPress={() => navigation.navigate('Timeline')}
              >
                <Text style={styles.seeMoreText}>See more changes</Text>
                <Icon name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Chat')}
        >
          <View style={[styles.actionIcon, {backgroundColor: COLORS.primary}]}>
            <Icon name="chat-processing" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Chat with AI</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('DailyLog')}
        >
          <View style={[styles.actionIcon, {backgroundColor: COLORS.success}]}>
            <Icon name="notebook" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Daily Log</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Diet')}
        >
          <View style={[styles.actionIcon, {backgroundColor: COLORS.accent}]}>
            <Icon name="food-apple" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Meal Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Timeline')}
        >
          <View style={[styles.actionIcon, {backgroundColor: COLORS.secondary}]}>
            <Icon name="calendar-week" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Timeline</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Summary */}
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, {backgroundColor: COLORS.accent}]}>
              <Icon name="water" size={20} color="#fff" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Water intake</Text>
              <Text style={styles.summaryText}>4/8 glasses</Text>
            </View>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, {backgroundColor: COLORS.primary}]}>
              <Icon name="pill" size={20} color="#fff" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Prenatal vitamin</Text>
              <Text style={styles.summaryText}>Not taken</Text>
            </View>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Take</Text>
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, {backgroundColor: COLORS.success}]}>
              <Icon name="emoticon" size={20} color="#fff" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Today's mood</Text>
              <Text style={styles.summaryText}>Happy</Text>
            </View>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Upcoming */}
      <Text style={styles.sectionTitle}>Upcoming</Text>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.appointmentItem}>
            <View style={styles.appointmentDate}>
              <Text style={styles.appointmentMonth}>OCT</Text>
              <Text style={styles.appointmentDay}>15</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentTitle}>Doctor's appointment</Text>
              <Text style={styles.appointmentLocation}>
                <Icon name="map-marker" size={14} color={COLORS.textSecondary} /> 
                Women's Health Clinic
              </Text>
            </View>
            <TouchableOpacity style={styles.appointmentButton}>
              <Icon name="calendar-edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.footer} />
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
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  welcomeHeader: {
    padding: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  weekBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginVertical: 8,
  },
  weekBadgeText: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  infoIcon: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  infoCardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoCardText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 20,
    marginBottom: 10,
    color: COLORS.textPrimary,
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 10,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  babyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  babyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F6FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  babyImageEmoji: {
    fontSize: 30,
  },
  babyInfoContent: {
    flex: 1,
  },
  babyInfoHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  babyInfoCompare: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: COLORS.divider,
  },
  developmentText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  bodyChanges: {
    marginTop: 8,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  changeText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  seeMoreText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
    fontSize: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  summaryDivider: {
    backgroundColor: COLORS.divider,
  },
  updateButton: {
    backgroundColor: '#F2F6FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  updateButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDate: {
    backgroundColor: COLORS.primaryLight,
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  appointmentMonth: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDay: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  appointmentLocation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appointmentButton: {
    padding: 10,
  },
  footer: {
    height: 20,
  },
});

export default HomeScreen;