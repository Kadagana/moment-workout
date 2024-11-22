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
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDropdown from '@/components/CustomDropdown';
import CustomBarChart from '@/components/CustomBarChart';
import CustomLineChart from '@/components/CustomLineChart';
import MuscleGroupList from '@/components/MuscleGroupList';
import { Dimensions } from 'react-native';
import styles from "@/styles/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from "@/components/DatePicker";

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

type WeeklyMuscleData = Record<string, WorkingSet[]>;

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
    const [weeklyMuscleGroups, setWeeklyMuscleGroups] = useState<WeeklyMuscleData>({}); // Weekly muscle groups data
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
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        const weekLabel = getWeekLabel(date);
        setWeekLabel(weekLabel);
    };

    const loadBarChartData = (weekLabel: string) => {
        const currentWeekData = weeklyMuscleGroups[weekLabel] || [];
        const muscleDataMap = currentWeekData.reduce((acc, item) => {
            acc[item.muscle] = item.sets;
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(muscleDataMap);
        const data = Object.values(muscleDataMap);

        setBarChartData({ labels, datasets: [{ data }] });
    };



    const loadLineChartData = async (muscle: string) => {
        const labels: string[] = [];
        const setsData: number[] = [];

        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i * 7);
            const weekLabel = getWeekLabel(date);

            const currentWeekData = weeklyMuscleGroups[weekLabel] || [];
            const muscleData = currentWeekData.find(item => item.muscle === muscle);
            const sets = muscleData ? muscleData.sets : 0;

            labels.unshift(weekLabel);
            setsData.unshift(sets);
        }

        setChartData({
            labels,
            datasets: [
                {
                    data: setsData,
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                },
            ],
        });
    };

    useEffect(() => {
        const weekLabel = getWeekLabel(selectedDate);
        loadBarChartData(weekLabel);
    }, [weeklyMuscleGroups, selectedDate]);

    useEffect(() => {
        if (selectedMuscleForChart) {
            loadLineChartData(selectedMuscleForChart);
        }
    }, [weeklyMuscleGroups, selectedMuscleForChart]);

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

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedData = await AsyncStorage.getItem('weeklyMuscleGroups');
                if (savedData) {
                    setWeeklyMuscleGroups(JSON.parse(savedData));
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        };
        loadData();
    }, []);

    const saveDataLocally = async (data: WeeklyMuscleData) => {
        try {
            await AsyncStorage.setItem('weeklyMuscleGroups', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data locally:', error);
        }
    };

    const addMuscleGroup = () => {
        const setsNumber = Number(newSets);
        if (!selectedMuscle || isNaN(setsNumber) || setsNumber <= 0) {
            Alert.alert('Please select a valid muscle group and enter a positive number of sets.');
            return;
        }

        const weekLabel = getWeekLabel(selectedDate);

        setWeeklyMuscleGroups(prev => {
            const currentWeekData = prev[weekLabel] || [];

            // Update sets if the muscle exists, otherwise add a new muscle
            const updatedWeekData = currentWeekData.map(item =>
                item.muscle === selectedMuscle ? { ...item, sets: item.sets + setsNumber } : item
            );

            if (!updatedWeekData.some(item => item.muscle === selectedMuscle)) {
                updatedWeekData.push({ muscle: selectedMuscle, sets: setsNumber });
            }

            const updatedData = { ...prev, [weekLabel]: updatedWeekData };

            // Save the updated data locally
            saveDataLocally(updatedData);

            return updatedData;
        });
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
                <ThemedView style={styles.container}>
                    <ThemedText type="title">Select Week: {weekLabel}</ThemedText>
                    <View style={styles.datePickerContainer}>
                        <DatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
                    </View>
                </ThemedView>
                <ThemedView>
                    <ThemedText type="subtitle">Working Sets for Week Starting {weekLabel}</ThemedText>
                    <MuscleGroupList
                        muscleGroups={weeklyMuscleGroups[weekLabel] || []}
                        setMuscleGroups={(updatedGroups) => {
                            setWeeklyMuscleGroups(prev => {
                                const updatedData = { ...prev, [weekLabel]: updatedGroups };
                                saveDataLocally(updatedData);
                                return updatedData;
                            });
                        }}
                        selectedMuscleForChart={selectedMuscleForChart}
                        setSelectedMuscleForChart={setSelectedMuscleForChart}
                    />


                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <TouchableOpacity onPress={openMusclePicker} style={styles.pickerButton}>
                        <View><Text style={styles.pickerButtonText}>
                            {selectedMuscle || 'Select Muscle Group To Add Sets'}
                        </Text></View>
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
