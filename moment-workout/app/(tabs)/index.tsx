import { Image, StyleSheet, Button, TextInput, Alert, Platform, View, Text, Modal, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { insertData, getWeekData } from '@/backend/async';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
// Define the type for each muscle set
type WorkingSet = {
    muscle: string;
    sets: number;
};
export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [weekLabel, setWeekLabel] = useState('');
    const [workingSets, setWorkingSets] = useState<WorkingSet[]>([]);
    const [newSets, setNewSets] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState(''); // For dropdown selection
    const [isMusclePickerVisible, setIsMusclePickerVisible] = useState(false); // Control Picker visibility


    // Predefined list of muscles
    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Quadriceps', 'Biceps', 'Abs', 'Triceps', 'Hamstrings', 'Glutes', 'Calves'];

    const getWeekLabel = (date: any): string => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        // Specify types correctly for year, month, and day
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return monday.toLocaleDateString('en-US', options);
    };


    useEffect(() => {
        const label = getWeekLabel(selectedDate);
        setWeekLabel(label);
        loadWeekData(label);
    }, [selectedDate]);

    const loadWeekData = async (week : any) => {
        try {
            getWeekData(week, (data : any) => {
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

    const saveMuscleGroups = async (updatedSets : any) => {
        try {
            console.log(`Saving muscle groups for week: ${weekLabel}`, updatedSets);
            await insertData(weekLabel, updatedSets);
        } catch (error) {
            console.error('Error saving muscle groups:', error);
        }
    };

    // Updates the set count for a specific muscle group.
    const updateSet = (muscle: string, newSetCount: number): void => {
        const updatedSets = workingSets.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);
    };

    const addMuscleGroup = () => {
        // Convert newSets to a number to check if it's a valid number
        const setsNumber = Number(newSets);

        if (!selectedMuscle || !newSets || isNaN(setsNumber)) {
            Alert.alert('Please select a valid muscle group and set count.');
            return;
        }

        const muscleExists = workingSets.some((item) => item.muscle === selectedMuscle);

        if (muscleExists) {
            Alert.alert('This muscle group has already been added.');
            return; // Prevent adding the muscle again
        }

        // Use setsNumber for the number of sets
        const newGroup = { muscle: selectedMuscle, sets: setsNumber };
        const updatedSets = [...workingSets, newGroup];
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);

        // Reset inputs
        setNewSets('');
        setSelectedMuscle('');
        setIsMusclePickerVisible(false);
    };


    const showDatePicker = () => {
        setShowPicker(true);
        setTempSelectedDate(selectedDate);
    };

    // Deletes a muscle group from the working sets.
    const deleteMuscleGroup = (muscle: string): void => {
        const updatedSets = workingSets.filter((item) => item.muscle !== muscle);
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);
    };

    const renderRightActions = (muscle : any) => (
        <View style={styles.deleteButton}>
            <TouchableOpacity onPress={() => deleteMuscleGroup(muscle)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const onDateChange = (event: any, date: any) => {
        if (date) {
            setTempSelectedDate(date);
        }
    };

    const onSaveDate = () => {
        setSelectedDate(tempSelectedDate);
        setShowPicker(false);
    };

    const openMusclePicker = () => {
        setIsMusclePickerVisible(true);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                        <Swipeable
                            key={index}
                            renderRightActions={() => renderRightActions(item.muscle)}
                        >
                            <ThemedView key={index} style={styles.setItem}>
                                <ThemedText>{item.muscle}</ThemedText>
                                <TextInput
                                    style={styles.setInput}
                                    keyboardType="numeric"
                                    defaultValue={item.sets.toString()}
                                    onChangeText={(value) => updateSet(item.muscle, parseInt(value))}
                                />
                            </ThemedView>
                        </Swipeable>
                    ))}
                </ThemedView>

                <ThemedView style={styles.inputContainer}>
                    <TouchableOpacity onPress={openMusclePicker} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>
                            {selectedMuscle || 'Select Muscle Group'}
                        </Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.numberOfSetsInput}
                        placeholder="Number of sets"
                        keyboardType="numeric"
                        value={newSets}
                        onChangeText={setNewSets}
                        returnKeyType="done"
                        onSubmitEditing={addMuscleGroup}
                    />
                    <Button title="Add Muscle Group" onPress={addMuscleGroup} />

                    {/* Modal to show the Picker */}
                    <Modal
                        transparent={true}
                        visible={isMusclePickerVisible}
                        animationType="slide"
                        onRequestClose={() => setIsMusclePickerVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedMuscle}
                                    onValueChange={(itemValue) => setSelectedMuscle(itemValue)}
                                >
                                    <Picker.Item label="Select Muscle Group" value="" />
                                    {muscleGroups.map((muscle, index) => (
                                        <Picker.Item key={index} label={muscle} value={muscle} />
                                    ))}
                                </Picker>
                                <Button title="Done" onPress={() => setIsMusclePickerVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                </ThemedView>
            </ParallaxScrollView>
        </GestureHandlerRootView>
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
    pickerButton: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 5,
        marginBottom: 8,
        alignItems: 'center',
    },
    pickerButtonText: {
        color: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    reactLogo: {
        height: 300,
        width: 1525,
        bottom: 0,
        left: 0,
        position: 'static',
    },
    numberOfSetsInput: {
        height: 30,
        color: 'white',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});
