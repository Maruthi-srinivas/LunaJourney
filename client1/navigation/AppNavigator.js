import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import DailyLogScreen from '../screens/DailyLogScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import TimelineScreen from '../screens/TimelineScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator for the main app flow
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Chat') {
            iconName = 'chat-processing';
          } else if (route.name === 'DailyLog') {
            iconName = 'notebook';
          } else if (route.name === 'Diet') {
            iconName = 'food-apple';
          } else if (route.name === 'Timeline') {
            iconName = 'calendar-week';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="DailyLog" 
        component={DailyLogScreen} 
        options={{ title: 'Daily Log' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatBotScreen} 
        options={{ title: 'Chat' }}
      />
      <Tab.Screen 
        name="Diet" 
        component={DietPlanScreen} 
        options={{ title: 'Diet Plan' }}
      />
      <Tab.Screen 
        name="Timeline" 
        component={TimelineScreen} 
        options={{ title: 'Timeline' }}
      />
    </Tab.Navigator>
  );
};

// Main navigator that includes both auth and main app flows
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Auth Flow */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ headerShown: false }}
        />
        
        {/* Main App Flow */}
        <Stack.Screen
          name="MainApp"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;