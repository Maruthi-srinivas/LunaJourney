import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthForm from '../components/AuthForm';
import { login } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [error, setError] = useState('');

  const handleLogin = async (data) => {
    try {
      setError('');
      console.log('Attempting login with:', data);
      const response = await login(data);
      console.log('Login response:', response.data);

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      navigation.navigate('MainApp');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthForm onSubmit={handleLogin} buttonText="Login" isLogin={true} />
      <View style={styles.linkContainer}>
        <Text>Don't have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
  },
});

export default LoginScreen;