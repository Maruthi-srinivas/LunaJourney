// filepath: c:\game\rproject\client\components\AuthForm.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

const AuthForm = ({ onSubmit, buttonText, isLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pregnancyWeek, setPregnancyWeek] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Which week of your pregnancy are you in? (1-40)"
            value={pregnancyWeek}
            onChangeText={setPregnancyWeek}
            keyboardType="numeric"
          />
        </>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <Button 
        title={buttonText} 
        onPress={() => onSubmit({ email, password, name, pregnancyWeek })} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: { 
    marginBottom: 15, 
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 5,
    borderColor: '#ddd'
  },
});

export default AuthForm;