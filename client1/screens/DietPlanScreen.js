import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph, Divider, Button, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfile, getDietPlan } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal as RNModal } from 'react-native';

// Add our colors
const COLORS = {
  primary: '#8E6BBF',
  primaryLight: '#B19CD9',
  secondary: '#F5B7B1',
  accent: '#5DADE2',
  success: '#7DCEA0',
  background: '#F9F4F5',
  cardBg: '#FFFFFF',
  textPrimary: '#3E4A5B',
  textSecondary: '#8896A6',
  divider: '#EBE3E8',
  warning: '#F4D03F'
};

const DietPlanScreen = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const [dietPlan, setDietPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [userWeek, setUserWeek] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weekModalVisible, setWeekModalVisible] = useState(false);
  const [weekInput, setWeekInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false); // New state to track if we're generating

  // Fetch user's current week and diet plan
  useEffect(() => {
    const fetchDiet = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const profileRes = await getProfile(token);
        console.log('Profile data:', profileRes.data);
        
        const { last_period_date } = profileRes.data;
        if (!last_period_date) {
          console.error('No last_period_date found in profile');
          return;
        }
        
        const start = new Date(last_period_date);
        const now = new Date();
        const week = Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
        console.log('Calculated week:', week);
        
        setUserWeek(week);
        setCurrentWeek(week);
        
        const res = await getDietPlan(token, week);
        console.log('Diet plan received');
        setDietPlan(res.data);
      } catch (error) {
        console.error('Error fetching diet plan:', error);
        // Provide fallback data if needed
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiet();
  }, []);

  // Show modal for generating a new diet plan
  const showGenerateModal = () => {
    setIsGenerating(true);
    setWeekModalVisible(true);
  };

  // Show modal for viewing a different week
  const showViewWeekModal = () => {
    setIsGenerating(false);
    setWeekModalVisible(true);
  };

  // Function to change the week or generate a new plan
  const changeWeek = async () => {
    const week = parseInt(weekInput);
    if (isNaN(week) || week < 1 || week > 42) {
      alert('Please enter a valid week (1-42)');
      return;
    }
    
    try {
      setIsLoading(true);
      setWeekModalVisible(false);
      const token = await AsyncStorage.getItem('token');
      
      // If generating, add a force=true parameter to the URL
      // This parameter will need to be handled on the server side to force regeneration
      let res;
      if (isGenerating) {
        // Call the same endpoint but with a different parameter to force regeneration
        res = await getDietPlan(token, week, true);
        alert('New diet plan generated successfully!');
      } else {
        res = await getDietPlan(token, week);
      }
      
      setDietPlan(res.data);
      setCurrentWeek(week);
    } catch (error) {
      console.error('Error changing week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to your DietPlanScreen.js component
  const generateGroceryList = () => {
    // This is a placeholder function - implement real grocery list generation later
    alert('Grocery list feature coming soon!');
  };

  if (isLoading || !dietPlan) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your meal plan...</Text>
      </View>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentPlan = dietPlan.dailyPlans[currentDay];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pageHeader}>
        <Icon name="food-apple-outline" size={30} color={COLORS.primary} />
        <Text style={styles.pageHeaderText}>Nutrition Plan</Text>
      </View>
      
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Title style={styles.headerTitle}>Week {currentWeek}</Title>
              <Text style={styles.headerSubtitle}>Pregnancy Nutrition</Text>
            </View>
            <TouchableOpacity 
              style={styles.changeWeekButton}
              onPress={showViewWeekModal}
            >
              <Text style={styles.changeWeekText}>Change Week</Text>
            </TouchableOpacity>
          </View>
          
          {currentWeek !== userWeek && (
            <View style={styles.weekNotice}>
              <Icon name="information-outline" size={18} color="#FFF" />
              <Text style={styles.notCurrentWeekText}>
                You're viewing week {currentWeek}. Your current week is {userWeek}.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Generate Diet Plan button - more prominent */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={showGenerateModal}
      >
        <Icon name="refresh" size={20} color="#FFF" />
        <Text style={styles.generateButtonText}>Generate New Diet Plan</Text>
      </TouchableOpacity>

      {/* Day selector - improved styling */}
      <Card style={styles.dayPickerCard}>
        <Card.Content>
          <Text style={styles.dayPickerTitle}>Select Day:</Text>
          <View style={styles.daySelector}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton, 
                  currentDay === index && styles.selectedDay
                ]}
                onPress={() => setCurrentDay(index)}
              >
                <Text style={[
                  styles.dayButtonText, 
                  currentDay === index && styles.selectedDayText
                ]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      {/* Meal cards - better spacing and icons */}
      <Text style={styles.mealSectionTitle}>{days[currentDay]}'s Meal Plan</Text>
      
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={styles.mealIconContainer}>
              <Icon name="coffee" size={22} color="#FFF" />
            </View>
            <Title style={styles.mealTitle}>Breakfast</Title>
          </View>
          <Text style={styles.dishTitle}>{currentPlan.breakfast.title}</Text>
          <Paragraph style={styles.dishDescription}>{currentPlan.breakfast.description}</Paragraph>
          <View style={styles.nutrientsContainer}>
            {Object.entries(currentPlan.breakfast.nutrients || {}).map(([key, value], index) => (
              <Text key={index} style={styles.nutrientPill}>{key}: {value}</Text>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIconContainer, {backgroundColor: COLORS.accent}]}>
              <Icon name="food" size={22} color="#FFF" />
            </View>
            <Title style={styles.mealTitle}>Lunch</Title>
          </View>
          <Text style={styles.dishTitle}>{currentPlan.lunch.title}</Text>
          <Paragraph style={styles.dishDescription}>{currentPlan.lunch.description}</Paragraph>
          <View style={styles.nutrientsContainer}>
            {Object.entries(currentPlan.lunch.nutrients || {}).map(([key, value], index) => (
              <Text key={index} style={styles.nutrientPill}>{key}: {value}</Text>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIconContainer, {backgroundColor: COLORS.success}]}>
              <Icon name="food-turkey" size={22} color="#FFF" />
            </View>
            <Title style={styles.mealTitle}>Dinner</Title>
          </View>
          <Text style={styles.dishTitle}>{currentPlan.dinner.title}</Text>
          <Paragraph style={styles.dishDescription}>{currentPlan.dinner.description}</Paragraph>
          <View style={styles.nutrientsContainer}>
            {Object.entries(currentPlan.dinner.nutrients || {}).map(([key, value], index) => (
              <Text key={index} style={styles.nutrientPill}>{key}: {value}</Text>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIconContainer, {backgroundColor: COLORS.secondary}]}>
              <Icon name="fruit-cherries" size={22} color="#FFF" />
            </View>
            <Title style={styles.mealTitle}>Snacks</Title>
          </View>
          {currentPlan.snacks.map((snack, index) => (
            <View key={index} style={styles.snackItem}>
              <Icon name="circle-small" size={20} color={COLORS.primary} />
              <Text style={styles.snackText}>{snack}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      <TouchableOpacity
        style={styles.groceryButton}
        onPress={generateGroceryList}
      >
        <Icon name="cart-outline" size={20} color="#FFF" />
        <Text style={styles.groceryButtonText}>Generate Grocery List</Text>
      </TouchableOpacity>

      {/* Modal - Keep the same structure but update styles */}
      <RNModal
        visible={weekModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setWeekModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setWeekModalVisible(false)}
        >
          <View style={styles.modalContent} onTouchStart={e => e.stopPropagation()}>
            <Title style={styles.modalTitle}>
              {isGenerating ? 'Generate Diet Plan for Week' : 'Select Pregnancy Week'}
            </Title>
            <TextInput
              label="Week (1-42)"
              value={weekInput}
              onChangeText={setWeekInput}
              keyboardType="numeric"
              style={styles.weekInput}
              mode="outlined"
            />
            <View style={styles.modalButtons}>
              <Button 
                onPress={() => setWeekModalVisible(false)}
                style={styles.modalButton}
                color={COLORS.textSecondary}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={changeWeek}
                style={styles.modalButton}
                color={COLORS.primary}
              >
                {isGenerating ? 'Generate Plan' : 'View Plan'}
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </RNModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 8,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  pageHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  headerCard: {
    margin: 15,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeWeekButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeWeekText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  weekNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  notCurrentWeekText: {
    fontStyle: 'italic',
    marginLeft: 6,
    color: '#FFF',
    fontSize: 13,
  },
  generateButton: {
    backgroundColor: COLORS.success,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  dayPickerCard: {
    margin: 10,
    borderRadius: 15,
  },
  dayPickerTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: COLORS.textPrimary,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#EBE3E8',
    minWidth: 45,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  dayButtonText: {
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  mealSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: COLORS.textPrimary,
  },
  mealCard: {
    margin: 10,
    borderRadius: 15,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  mealIconContainer: {
    backgroundColor: COLORS.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitle: {
    marginLeft: 12,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.textPrimary,
  },
  dishDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  nutrientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  nutrientPill: {
    backgroundColor: '#F2F6FE',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 3,
    fontSize: 12,
    color: COLORS.accent,
  },
  snackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  snackText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  groceryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  groceryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekInput: {
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  modalButton: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
});

export default DietPlanScreen;