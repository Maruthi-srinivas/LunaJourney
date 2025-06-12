import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatBotScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your MomWise AI assistant. How can I help you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      // Call your API endpoint with token
      const response = await axios.post('http://192.168.1.5:5000/api/chat/message', 
        { message: inputText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        text: response.data.reply, 
        isUser: false 
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      const errorText = error.response?.data?.details || 
                        error.response?.data?.error || 
                        "Sorry, I'm having trouble connecting. Please try again later.";
      const errorMessage = { 
        id: (Date.now() + 1).toString(), 
        text: errorText, 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.isUser ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={isLoading || inputText.trim() === ''}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 15,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#eeeeee',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6200ee',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default ChatBotScreen;