import { Image, StyleSheet, Button, TextInput, Alert, Platform, View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { insertData, getWeekData } from '../../backend/async';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [weekLabel, setWeekLabel] = useState('');
    const [workingSets, setWorkingSets] = useState([]);
    const [newMuscle, setNewMuscle] = useState('');
    const [newSets, setNewSets] = useState('');

    const getWeekLabel = (date) => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const options = { month: 'short', day: 'numeric' };
        return monday.toLocaleDateString('en-US', options);
    };

    useEffect(() => {
        const label = getWeekLabel(selectedDate);
        setWeekLabel(label);
        loadWeekData(label);
    }, [selectedDate]);

    const loadWeekData = async (week) => {
        try {
            getWeekData(week, (data) => {
                if (data.length > 0) {
                    setWorkingSets(data);
                } else {
                    setWorkingSets([]);
                }
            });
        } catch (error) {
            console.error("Error loading week data:", error);
        }
    };

    const saveData = async () => {
        try {
            await insertData(weekLabel, workingSets);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const updateSet = (muscle, newSetCount) => {
        const updatedSets = workingSets.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setWorkingSets(updatedSets);
        saveData();
    };

    const addMuscleGroup = () => {
        if (!newMuscle || !newSets || isNaN(newSets)) {
            Alert.alert('Please enter a valid muscle group and set count.');
            return;
        }

        const newGroup = { muscle: newMuscle, sets: parseInt(newSets) };
        const updatedSets = [...workingSets, newGroup];
        setWorkingSets(updatedSets);
        saveData();
        setNewMuscle('');
        setNewSets('');
    };

    const showDatePicker = () => {
        setShowPicker(true);
        setTempSelectedDate(selectedDate);
    };

    const onDateChange = (event, date) => {
        if (date) {
            setTempSelectedDate(date);
        }
    };

    const onSaveDate = () => {
        saveData();
        setSelectedDate(tempSelectedDate);
        setShowPicker(false);
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
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Select Week: {weekLabel}</ThemedText>
                <View style={styles.buttonContainer}>
                    <Button title="Select Date" onPress={showDatePicker} />
                </View>

                {showPicker && (
                    <View>
                        {Platform.OS === 'web' ? (
                            <input
                                type="date"
                                value={tempSelectedDate.toISOString().substring(0, 10)}
                                onChange={(e) => onDateChange(null, new Date(e.target.value))}
                                style={{ width: '100%', backgroundColor: 'white' }}
                            />
                        ) : (
                            <DateTimePicker
                                value={tempSelectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                style={{ width: '100%', backgroundColor: 'white' }}
                                textColor={'white'}
                            />
                        )}
                        <Button title="Save Date" onPress={onSaveDate} />
                    </View>
                )}
            </ThemedView>

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
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 8,
        alignItems: 'center',
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
