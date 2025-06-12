import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AuthForm from '../components/AuthForm';
import { signup } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = ({ navigation }) => {
  const [error, setError] = useState('');

  const handleSignup = async (data) => {
    try {
      setError('');
      const response = await signup(data);

      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

      navigation.navigate('MainApp');
    } catch (error) {
      setError(error.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AuthForm onSubmit={handleSignup} buttonText="Sign Up" isLogin={false} />
      <View style={styles.linkContainer}>
        <Text>Already have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Login
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

export default SignupScreen;