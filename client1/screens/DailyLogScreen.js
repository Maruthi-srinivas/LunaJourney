import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Title, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DailyLogScreen = () => {
  const [date, setDate] = useState(new Date());
  const [bloodPressure, setBloodPressure] = useState({ systolic: '', diastolic: '' });
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);
  
  const commonSymptoms = [
    'Nausea', 'Fatigue', 'Headache', 'Back Pain', 
    'Heartburn', 'Swelling', 'Cramps', 'Insomnia'
  ];

  const moodOptions = ['Great', 'Good', 'Okay', 'Not Great', 'Bad'];

  const toggleSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const saveLog = () => {
    // Here you would save the log data to your backend
    const logData = {
      date,
      bloodPressure,
      weight,
      mood,
      symptoms,
      notes,
      waterIntake
    };
    console.log('Saving log:', logData);
    // API call would go here
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.dateText}>{formatDate(date)}</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Vitals</Title>
          
          <Text style={styles.label}>Blood Pressure</Text>
          <View style={styles.bpContainer}>
            <TextInput
              style={styles.bpInput}
              value={bloodPressure.systolic}
              onChangeText={text => setBloodPressure({...bloodPressure, systolic: text})}
              keyboardType="numeric"
              placeholder="Systolic"
              mode="outlined"
            />
            <Text style={styles.divider}>/</Text>
            <TextInput
              style={styles.bpInput}
              value={bloodPressure.diastolic}
              onChangeText={text => setBloodPressure({...bloodPressure, diastolic: text})}
              keyboardType="numeric"
              placeholder="Diastolic"
              mode="outlined"
            />
          </View>
          
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter weight"
            mode="outlined"
            style={styles.input}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>How are you feeling?</Title>
          <SegmentedButtons
            value={mood}
            onValueChange={setMood}
            buttons={moodOptions.map(m => ({ value: m, label: m }))}
            style={styles.moodSelector}
          />
          
          <Text style={styles.label}>Symptoms</Text>
          <View style={styles.symptomsContainer}>
            {commonSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  symptoms.includes(symptom) && styles.selectedSymptom
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={[
                  styles.symptomText,
                  symptoms.includes(symptom) && styles.selectedSymptomText
                ]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Water Intake</Text>
          <View style={styles.waterContainer}>
            {[...Array(8)].map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setWaterIntake(i + 1)}
                style={styles.waterIcon}
              >
                <Icon
                  name={i < waterIntake ? "cup-water" : "cup-outline"}
                  size={28}
                  color={i < waterIntake ? "#1e88e5" : "#757575"}
                />
              </TouchableOpacity>
            ))}
            <Text style={styles.waterText}>{waterIntake}/8 glasses</Text>
          </View>
          
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling today?"
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.notesInput}
          />
        </Card.Content>
      </Card>
      
      <Button
        mode="contained"
        onPress={saveLog}
        style={styles.saveButton}
      >
        Save Today's Log
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  card: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  bpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpInput: {
    flex: 1,
  },
  divider: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  input: {
    marginBottom: 10,
  },
  moodSelector: {
    marginTop: 10,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  symptomButton: {
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 20,
    padding: 8,
    margin: 5,
  },
  selectedSymptom: {
    backgroundColor: '#6200ee',
  },
  symptomText: {
    color: '#6200ee',
  },
  selectedSymptomText: {
    color: 'white',
  },
  waterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
  },
  waterIcon: {
    margin: 5,
  },
  waterText: {
    marginLeft: 10,
    fontSize: 16,
  },
  notesInput: {
    marginTop: 10,
  },
  saveButton: {
    marginVertical: 20,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
});

export default DailyLogScreen;