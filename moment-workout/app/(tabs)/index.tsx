import { Image, StyleSheet, Button, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {color} from "ansi-fragments";

export default function HomeScreen() {
    const [weeks, setWeeks] = useState(['Sep 24', 'Sep 17', 'Sep 10']); // Example weeks
    const [selectedWeek, setSelectedWeek] = useState('Sep 24'); // Default selected week
    const [weekData, setWeekData] = useState({});
    const [workingSets, setWorkingSets] = useState([
        { muscle: 'Quadriceps', sets: 4 },
        { muscle: 'Hamstrings', sets: 3 },
        { muscle: 'Glutes', sets: 2 },
        { muscle: 'Chest', sets: 6 },
        { muscle: 'Shoulders', sets: 2 },
        { muscle: 'Back', sets: 8 },
        { muscle: 'Biceps', sets: 2 },
        { muscle: 'Triceps', sets: 3 },
        { muscle: 'Forearms', sets: 3 },
        { muscle: 'Abs', sets: 1 },
    ]);

    const [newMuscle, setNewMuscle] = useState('');
    const [newSets, setNewSets] = useState('');

    // Load week data from AsyncStorage when component mounts
    useEffect(() => {
        getSavedData();
    }, []);

    // Fetch the saved data for all weeks
    const getSavedData = async () => {
        try {
            const savedWeekData = await AsyncStorage.getItem('weekData');
            if (savedWeekData !== null) {
                const parsedData = JSON.parse(savedWeekData);
                setWeekData(parsedData);
                // Load the data for the selected week
                if (parsedData[selectedWeek]) {
                    setWorkingSets(parsedData[selectedWeek]);
                }
            }
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    // Save data for the selected week
    const saveData = async () => {
        const updatedWeekData = { ...weekData, [selectedWeek]: workingSets };
        try {
            await AsyncStorage.setItem('weekData', JSON.stringify(updatedWeekData));
            setWeekData(updatedWeekData); // Update the week data in state
        } catch (error) {
            console.error("Error saving data", error);
        }
    };

    // Update set count for a muscle
    const updateSet = (muscle, newSetCount) => {
        const updatedSets = workingSets.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setWorkingSets(updatedSets);
        saveData(); // Save data after updating
    };

    // Add a new muscle group
    const addMuscleGroup = () => {
        if (!newMuscle || !newSets || isNaN(newSets)) {
            Alert.alert('Please enter a valid muscle group and set count.');
            return;
        }

        const newGroup = { muscle: newMuscle, sets: parseInt(newSets) };
        const updatedSets = [...workingSets, newGroup];
        setWorkingSets(updatedSets);
        saveData(); // Save new data after adding
        setNewMuscle(''); // Clear input fields
        setNewSets('');
    };

    // Handle week change and load corresponding data
    const handleWeekChange = (week) => {
        // Save current week's data before switching
        saveData();
        setSelectedWeek(week);
        // Load new week's data if available, otherwise reset to empty
        if (weekData[week]) {
            setWorkingSets(weekData[week]);
        } else {
            setWorkingSets([]); // No data for the week, show empty state
        }
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
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
    setsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        color: 'black',
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
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
