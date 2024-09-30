import { Image, StyleSheet, Button, TextInput, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { insertData, getWeekData } from '../../backend/async';  // Use AsyncStorage functions
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Picker } from '@react-native-picker/picker';

export default function HomeScreen() {
    const [weeks, setWeeks] = useState(['Sep 24', 'Sep 17', 'Sep 10']); // Example weeks
    const [selectedWeek, setSelectedWeek] = useState('Sep 24'); // Default selected week
    const [workingSets, setWorkingSets] = useState([]); // Working sets per week

    const [newMuscle, setNewMuscle] = useState('');
    const [newSets, setNewSets] = useState('');

    // Load week data when the component mounts
    useEffect(() => {
        loadWeekData(selectedWeek);  // Load the data for the default selected week
    }, [selectedWeek]);

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
            await insertData(selectedWeek, workingSets);
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

    // Handle week change and load corresponding data from AsyncStorage
    const handleWeekChange = (week) => {
        saveData();  // Save current week's data before switching
        setSelectedWeek(week);
        loadWeekData(week);  // Load the data for the new week
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
                <ThemedText type="title">Select Week:</ThemedText>
                <Picker
                    selectedValue={selectedWeek}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleWeekChange(itemValue)}
                >
                    {weeks.map((week, index) => (
                        <Picker.Item key={index} label={week} value={week} />
                    ))}
                </Picker>
            </ThemedView>

            {/* Show working sets for selected week */}
            <ThemedView>
                <ThemedText type="subtitle">Working Sets for {selectedWeek}</ThemedText>
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
    picker: {
        height: 50,
        width: 150,
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
