import {
    Image,
    StyleSheet,
    Button,
    TextInput,
    Alert,
    Platform,
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { insertData, getWeekData } from '@/backend/async';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDropdown from '@/components/CustomDropdown';
import CustomBarChart from '@/components/CustomBarChart';
import CustomLineChart from '@/components/CustomLineChart';
import MuscleGroupList from '@/components/MuscleGroupList';
import { Dimensions } from 'react-native';
import styles from "@/styles/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get("window").width;
const barChartConfig = {
    backgroundColor: 'black',
    backgroundGradientFrom: 'maroon',
    backgroundGradientTo: 'white',
    decimalPlaces: 0,
    color: (opacity = 0.5) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `black`,
    style: {
        borderRadius: 16,
    },
    propsForBackgroundLines: {
        stroke: '#e3e3e3',
    },
};

const lineChartConfig = {
    backgroundColor: 'green',
    backgroundGradientFrom: 'black',
    backgroundGradientTo: 'maroon',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 18,
    },
    propsForDots: {
        r: '8',
        strokeWidth: '1',
        stroke: '#ffa726',
    },
};

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
    const [chartData, setChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({ labels: [], datasets: [{ data: [] }] });
    const [selectedMuscleForChart, setSelectedMuscleForChart] = useState('');
    // const [muscleGroups, setMuscleGroups] = useState([
    //     'Chest',
    //     'Back',
    //     'Shoulders',
    //     'Quadriceps',
    //     'Biceps',
    //     'Abs',
    //     'Triceps',
    //     'Hamstrings',
    //     'Glutes',
    //     'Calves',
    // ]);
    const [muscleGroups, setMuscleGroups] = useState<WorkingSet[]>([
        { muscle: 'Chest', sets: 0 },
        { muscle: 'Back', sets: 0 },
        { muscle: 'Shoulders', sets: 0 },
        // Add more initial items as needed
    ]);
    const [newMuscleGroup, setNewMuscleGroup] = useState('');
    const [barChartData, setBarChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({ labels: [], datasets: [{ data: [] }] });

    const getWeekLabel = (date: any): string => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return monday.toLocaleDateString('en-US', options);
    };

    const loadBarChartData = (weekData: WorkingSet[]) => {
        const muscleDataMap = muscleGroups.reduce((acc, muscle) => {
            acc[muscle] = 0;
            return acc;
        }, {} as Record<string, number>);

        weekData.forEach((item) => {
            if (muscleDataMap[item.muscle] !== undefined) {
                muscleDataMap[item.muscle] = item.sets;
            }
        });

        const filteredData = Object.entries(muscleDataMap).filter(([_, sets]) => sets > 0);
        const labels = filteredData.map(([muscle]) => muscle);
        const data = filteredData.map(([_, sets]) => sets);

        setBarChartData({ labels, datasets: [{ data }] });
    };

    const loadLineChartData = async (muscle: string) => {
        const labels: string[] = [];
        const setsData: number[] = [];

        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i * 7);
            const weekLabel = getWeekLabel(date);

            const weeklyData = await new Promise<WorkingSet[]>((resolve) => {
                getWeekData(weekLabel, (data: WorkingSet[]) => resolve(data || []));
            });

            const muscleData = weeklyData.find((item) => item.muscle === muscle);
            const sets = muscleData ? muscleData.sets : 0;

            labels.unshift(weekLabel);
            setsData.unshift(sets);
        }

        setChartData({ labels, datasets: [{ data: setsData }] });
    };

    useEffect(() => {
        if (selectedMuscleForChart) {
            loadLineChartData(selectedMuscleForChart);
        }
    }, [selectedMuscleForChart, workingSets]);

    useEffect(() => {
        const label = getWeekLabel(selectedDate);
        setWeekLabel(label);
        loadWeekData(label);
    }, [selectedDate]);

    const loadWeekData = async (week: string) => {
        try {
            getWeekData(week, (data: WorkingSet[]) => {
                if (data.length > 0) {
                    setWorkingSets(data);
                } else {
                    setWorkingSets([]);
                }
                loadBarChartData(data);
            });
        } catch (error) {
            console.error("Error loading week data:", error);
        }
    };

    const saveMuscleGroups = async (updatedSets: any) => {
        try {
            await insertData(weekLabel, updatedSets);
        } catch (error) {
            console.error('Error saving muscle groups:', error);
        }
    };

    const updateSet = (muscle: string, newSetCount: number): void => {
        const updatedMuscleGroups = muscleGroups.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setMuscleGroups(updatedMuscleGroups);
        saveMuscleGroups(updatedMuscleGroups);
    };
    useEffect(() => {
        console.log('Selected Muscle:', selectedMuscle);
    }, [selectedMuscle]);




    const addMuscleGroup = () => {
        const setsNumber = Number(newSets);
        if (!selectedMuscle || isNaN(setsNumber) || setsNumber <= 0) {
            Alert.alert('Please select a valid muscle group and enter a positive number of sets.');
            return;
        }

        // Check if the muscle group already exists
        const muscleExists = muscleGroups.some((item) => item.muscle === selectedMuscle);
        if (muscleExists) {
            // Update the sets for the existing muscle group
            const updatedMuscleGroups = muscleGroups.map((item) =>
                item.muscle === selectedMuscle ? { ...item, sets: item.sets + setsNumber } : item
            );
            setMuscleGroups(updatedMuscleGroups);
        } else {
            // Add new muscle group
            const newGroup: WorkingSet = { muscle: selectedMuscle, sets: setsNumber };
            const updatedGroups = [...muscleGroups, newGroup];
            setMuscleGroups(updatedGroups);
        }

        // Clear inputs
        setSelectedMuscle('');
        setNewSets('');
        setIsMusclePickerVisible(false);
    };

    const showDatePicker = () => {
        setShowPicker(true);
        setTempSelectedDate(selectedDate);
    };

    const deleteMuscleGroup = (muscle: string): void => {
        const updatedSets = workingSets.filter((item) => item.muscle !== muscle);
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);
    };

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
            <ParallaxScrollView headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={
                <Image source={require('@/assets/images/caracal.jpg')} style={styles.reactLogo} />
            }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Select Muscle Group for Chart</ThemedText>
                    <CustomDropdown
                        items={muscleGroups.map(group => group.muscle)} // Extracting the muscle names for dropdown
                        selectedValue={selectedMuscleForChart}
                        onValueChange={setSelectedMuscleForChart}
                    />
                    {selectedMuscleForChart && (
                        <CustomLineChart data={chartData} config={lineChartConfig} />
                    )}
                </ThemedView>
                <ThemedView style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>
                        Sets per Muscle Group for the Week of {weekLabel}
                    </Text>
                    <CustomBarChart data={barChartData} config={barChartConfig} />
                </ThemedView>
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
                    <MuscleGroupList
                        muscleGroups={muscleGroups}
                        setMuscleGroups={setMuscleGroups} // Ensure this is passed correctly
                        selectedMuscleForChart={selectedMuscleForChart}
                        setSelectedMuscleForChart={setSelectedMuscleForChart}
                    />

                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <TouchableOpacity onPress={openMusclePicker} style={styles.pickerButton}>
                        <Text style={styles.pickerButtonText}>
                            {selectedMuscle || 'Select Muscle Group To Add Sets'}
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
                    <Button title="Add Muscle Group And Sets" onPress={addMuscleGroup} />
                    <Modal
                        transparent={true}
                        visible={isMusclePickerVisible}
                        animationType="slide"
                        onRequestClose={() => setIsMusclePickerVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <CustomDropdown
                                    items={muscleGroups.map(group => group.muscle)}
                                    selectedValue={selectedMuscle}
                                    onValueChange={setSelectedMuscle} // This ensures state is updated
                                />

                                <Button title="Done" onPress={() => setIsMusclePickerVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <TextInput
                        style={styles.newMuscleInput}
                        placeholder="Enter new muscle group"
                        placeholderTextColor="#999"
                        value={newMuscleGroup}
                        onChangeText={setNewMuscleGroup}
                    />
                    <Button
                        title="Add Muscle Group"
                        onPress={() => {
                            const trimmedMuscleGroup = newMuscleGroup.trim();
                            if (trimmedMuscleGroup === '') {
                                Alert.alert('Error', 'Muscle group name cannot be empty.');
                                return;
                            }

                            // Check if muscle already exists in the array of objects
                            const muscleExists = muscleGroups.some(group => group.muscle === trimmedMuscleGroup);
                            if (muscleExists) {
                                Alert.alert('Error', 'This muscle group already exists.');
                                return;
                            }

                            // Add new muscle group as an object
                            const newGroup = { muscle: trimmedMuscleGroup, sets: 0 };
                            const updatedGroups = [...muscleGroups, newGroup];
                            setMuscleGroups(updatedGroups); // Correctly update state
                            console.log('Updated muscleGroups:', updatedGroups); // Debugging statement
                            setNewMuscleGroup(''); // Clear the input
                        }}
                    />


                </ThemedView>
            </ParallaxScrollView>
        </GestureHandlerRootView>
    );
}
