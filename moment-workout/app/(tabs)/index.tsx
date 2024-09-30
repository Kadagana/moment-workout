import { Image, StyleSheet, Button, TextInput, Alert, Platform, View , Text} from 'react-native';
import React, { useState, useEffect } from 'react';
import { insertData, getWeekData } from '../../backend/async';  // Use AsyncStorage functions
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());  // Default to current date
    const [showPicker, setShowPicker] = useState(false);  // To control DateTimePicker visibility
    const [weekLabel, setWeekLabel] = useState('');  // Displayed week label

    const [workingSets, setWorkingSets] = useState([]);  // Working sets per week
    const [newMuscle, setNewMuscle] = useState('');
    const [newSets, setNewSets] = useState('');

    // Function to get the start of the week (Monday)
    const getWeekLabel = (date) => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);  // Adjust when day is Sunday
        monday.setDate(diff);
        const options = { month: 'short', day: 'numeric' };
        return monday.toLocaleDateString('en-US', options);  // Format as "Sep 24"
    };

    // Update the week label when the date changes
    useEffect(() => {
        console.log('Date updated:', selectedDate);  // Debug log
        setWeekLabel(getWeekLabel(selectedDate));
        loadWeekData(getWeekLabel(selectedDate));
    }, [selectedDate]);

    // Load week data from AsyncStorage
    const loadWeekData = async (week) => {
        try {
            getWeekData(week, (data) => {
                if (data.length > 0) {
                    setWorkingSets(data);  // Load existing data if available
                } else {
                    setWorkingSets([]);  // Otherwise, reset the working sets
                }
            });
        } catch (error) {
            console.error("Error loading week data:", error);
        }
    };

    // Save data for the current week
    const saveData = async () => {
        try {
            await insertData(weekLabel, workingSets);
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    // Update set count for a muscle in the UI and save
    const updateSet = (muscle, newSetCount) => {
        const updatedSets = workingSets.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setWorkingSets(updatedSets);
        saveData();  // Save updated data
    };

    // Add a new muscle group and save it
    const addMuscleGroup = () => {
        if (!newMuscle || !newSets || isNaN(newSets)) {
            Alert.alert('Please enter a valid muscle group and set count.');
            return;
        }

        const newGroup = { muscle: newMuscle, sets: parseInt(newSets) };
        const updatedSets = [...workingSets, newGroup];
        setWorkingSets(updatedSets);
        saveData();  // Save the new data
        setNewMuscle('');  // Clear input fields
        setNewSets('');
    };

    // Show the DateTimePicker for selecting a week
    const showDatePicker = () => {
        setShowPicker(true);
    };

    // Handle date selection on iOS
    const onDateChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            setWeekLabel(getWeekLabel(date)); // Update week label when date changes
        }
        setShowPicker(false); // Hide picker after selection
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/caracal.jpg')}
                    style={styles.reactLogo}
                />
            }
        >
            {/* Picker to select week */}
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Select Week: {weekLabel}</ThemedText>
                <Button title="Select Date" onPress={showDatePicker} />

                {/* Show the DateTimePicker */}
                {showPicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={onDateChange}
                        style={{ width: '100%', backgroundColor: 'white' }}  // Style adjustment for visibility
                    />
                )}
            </ThemedView>

            {/* Show working sets for selected week */}
            <ThemedView>
                <ThemedText type="subtitle">Working Sets for Week Starting {weekLabel}</ThemedText>
                {workingSets.map((item, index) => (
                    <ThemedView key={index} style={styles.setItem}>
                        <ThemedText>{item.muscle}</ThemedText>
                        <TextInput
                            style={styles.setInput}
                            keyboardType="numeric"
                            defaultValue={item.sets.toString()}
                            onChangeText={(value) => updateSet(item.muscle, parseInt(value))}
                        />
                    </ThemedView>
                ))}
            </ThemedView>

            {/* Add new muscle group */}
            <ThemedView style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Muscle group"
                    value={newMuscle}
                    onChangeText={setNewMuscle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Number of sets"
                    keyboardType="numeric"
                    value={newSets}
                    onChangeText={setNewSets}
                />
                <Button title="Add Muscle Group" onPress={addMuscleGroup} />
            </ThemedView>
            <View style={{ padding: 20 }}>
                {/* Show the current week starting date */}
                <Text style={{ marginBottom: 10 }}>Week Starting: {weekLabel || getWeekLabel(selectedDate)}</Text>

                {/* Button to show DateTimePicker */}
                <Button title="Select Week" onPress={() => setShowPicker(true)} />

                {/* DateTimePicker for iOS/Android */}
                {showPicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={onDateChange}
                        style={{ width: '100%' }}
                    />
                )}
            </View>
        </ParallaxScrollView>

    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    setItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    setInput: {
        width: 50,
        padding: 5,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        textAlign: 'center',
        color: 'white',
    },
    inputContainer: {
        marginTop: 16,
        padding: 16,
    },
    input: {
        padding: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 8,
        color: 'white',
    },
    reactLogo: {
        height: 300,
        width: 1525,
        bottom: 0,
        left: 0,
        position: 'static',
    },
});
