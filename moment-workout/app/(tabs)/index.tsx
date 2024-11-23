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
import { Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomDropdown from '@/components/CustomDropdown';
import CustomBarChart from '@/components/CustomBarChart';
import CustomLineChart from '@/components/CustomLineChart';
import MuscleGroupList from '@/components/MuscleGroupList';
import styles from "@/styles/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from "@/components/DatePicker";
import DateRangePicker from "@/components/DateRangePicker";

const screenWidth = Dimensions.get('window').width;
const getChartWidth = (range: string): number => {
    switch (range) {
        case '1_month':
            return screenWidth; // Smallest width for a month
        case '3_months':
            return screenWidth * 3; // Medium width for three months
        case '6_months':
            return screenWidth * 4; // Larger width for six months
        case '1_year':
            return screenWidth * 6; // Largest width for a year
        default:
            return screenWidth;
    }
};

const barChartConfig = {
    backgroundColor: 'maroon',
    backgroundGradientFrom: '#800000', // Dark maroon
    backgroundGradientTo: '#ff4d4d', // Light red
    decimalPlaces: 0, // No decimal points
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text for better contrast
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White labels
    style: {
        borderRadius: 16,
    },
    propsForBackgroundLines: {
        stroke: '#ffcccc', // Light red background lines for subtlety
    },
};

const lineChartConfig = {
    backgroundColor: 'maroon',
    backgroundGradientFrom: '#800000',
    backgroundGradientTo: '#ff4d4d',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White text for better contrast
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ff6666',
    },
    propsForBackgroundLines: {
        stroke: '#ffcccc',
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
    const [chartData, setChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
        labels: [],
        datasets: [{ data: [] }],
    });
    const [selectedRange, setSelectedRange] = useState('1_month');
    const [chartWidth, setChartWidth] = useState(screenWidth);
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
        const day = monday.getDay(); // Get current day (0 = Sunday, 6 = Saturday)
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday as the first day of the week
        monday.setDate(diff); // Set the date to the calculated Monday
        return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Return the formatted date
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
    const calculateDateRange = (range: string) => {
        const now = new Date();
        const endDate = new Date(); // Current date (the end of the range)
        let startDate: Date | null = null;

        switch (range) {
            case '1_month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case '3_months':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6_months':
                startDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case '1_year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = null; // Fallback for unexpected cases
        }

        return { startDate, endDate };
    };


    const loadLineChartData = async (muscle: string) => {
        const { startDate, endDate } = calculateDateRange(selectedRange);
        const labels: string[] = [];
        const setsData: number[] = [];

        if (!startDate || !endDate) {
            console.error("Invalid date range for line chart.");
            return;
        }

        // Generate all weeks between `startDate` and `endDate`
        let currentDate = new Date(startDate); // Ensure `currentDate` is not modified elsewhere
        while (currentDate <= endDate) {
            const weekStart = new Date(currentDate); // Clone `currentDate` to avoid unintended shifts
            const weekLabel = getWeekLabel(weekStart); // Use `getWeekLabel` for consistent labels
            labels.push(weekLabel);

            const currentWeekData = weeklyMuscleGroups[weekLabel] || [];
            const muscleData = currentWeekData.find((item) => item.muscle === muscle);
            const sets = muscleData ? muscleData.sets : 0;

            setsData.push(sets); // Add 0 if no sets for the week

            // Move to the next week without altering the initial `currentDate`
            currentDate.setDate(currentDate.getDate() + 7);
        }

        setChartData({
            labels,
            datasets: [
                {
                    data: setsData,
                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Example color
                },
            ],
        });
    };



    const fetchDataForRange = async (range: string) => {
        const { startDate, endDate } = calculateDateRange(range);
        const labels: string[] = [];
        const datasets: { data: number[] } = { data: [] };

        if (!startDate || !endDate) {
            return { labels: [], datasets: [{ data: [] }] };
        }

        let currentDate = new Date(startDate); // Avoid overwriting `startDate`
        while (currentDate <= endDate) {
            const weekStart = new Date(currentDate); // Clone `currentDate`
            const weekLabel = getWeekLabel(weekStart); // Consistent week label
            labels.push(weekLabel);

            const currentWeekData = weeklyMuscleGroups[weekLabel] || [];
            const totalSets = currentWeekData.reduce((sum, item) => sum + item.sets, 0);

            datasets.data.push(totalSets);

            // Move to the next week without altering the original reference
            currentDate.setDate(currentDate.getDate() + 7);
        }

        return { labels, datasets: [datasets] };
    };



    useEffect(() => {
        // Adjust chart width based on selected range
        setChartWidth(getChartWidth(selectedRange));
        // Logic to fetch and set data for the selected range
        // Assume `fetchDataForRange` is a function that updates `chartData`
        fetchDataForRange(selectedRange).then((data) => setChartData(data));
    }, [selectedRange]);




    useEffect(() => {
        if (selectedMuscleForChart) {
            loadLineChartData(selectedMuscleForChart);
        }
    }, [selectedRange, selectedMuscleForChart, weeklyMuscleGroups]);

    useEffect(() => {
        if (weekLabel) {
            loadBarChartData(weekLabel);
        }
    }, [weekLabel, weeklyMuscleGroups]);

    useEffect(() => {
        const label = getWeekLabel(selectedDate);
        setWeekLabel(label);
        loadWeekData(label);
    }, [selectedDate]);

    const loadWeekData = async (week: string) => {
        try {
            getWeekData(week, (data: WorkingSet[]) => {
                setWorkingSets(data.length > 0 ? data : []);
                loadBarChartData(week); // Pass the weekLabel here
            });
        } catch (error) {
            console.error("Error loading week data:", error);
        }
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

        setWeeklyMuscleGroups((prev) => {
            const currentWeekData = prev[weekLabel] || [];

            // Update sets if the muscle exists, otherwise add a new muscle
            const updatedWeekData = currentWeekData.map((item) =>
                item.muscle === selectedMuscle ? { ...item, sets: item.sets + setsNumber } : item
            );

            if (!updatedWeekData.some((item) => item.muscle === selectedMuscle)) {
                updatedWeekData.push({ muscle: selectedMuscle, sets: setsNumber });
            }

            const updatedData = { ...prev, [weekLabel]: updatedWeekData };

            // Save the updated data locally
            saveDataLocally(updatedData);

            return updatedData;
        });

        // Add the muscle group to the global list if it doesn't already exist
        if (!muscleGroups.some((group) => group.muscle === selectedMuscle)) {
            const newGroup = { muscle: selectedMuscle, sets: 0 };
            const updatedMuscleGroups = [...muscleGroups, newGroup];
            setMuscleGroups(updatedMuscleGroups);

            // Save the updated muscle groups list to AsyncStorage
            saveMuscleGroupsLocally(updatedMuscleGroups);
        }

        // Clear inputs
        setSelectedMuscle('');
        setNewSets('');
        setIsMusclePickerVisible(false);
    };

// Helper function to save muscle groups locally
    const saveMuscleGroupsLocally = async (groups: WorkingSet[]) => {
        try {
            await AsyncStorage.setItem('muscleGroups', JSON.stringify(groups));
        } catch (error) {
            console.error('Error saving muscle groups locally:', error);
        }
    };

    useEffect(() => {
        const loadMuscleGroups = async () => {
            try {
                const savedMuscleGroups = await AsyncStorage.getItem('muscleGroups');
                if (savedMuscleGroups) {
                    setMuscleGroups(JSON.parse(savedMuscleGroups));
                } else {
                    // Save default muscle groups to AsyncStorage if no data exists
                    const defaultGroups = [
                        { muscle: 'Chest', sets: 0 },
                        { muscle: 'Back', sets: 0 },
                        { muscle: 'Shoulders', sets: 0 },
                    ];
                    setMuscleGroups(defaultGroups);
                    await AsyncStorage.setItem('muscleGroups', JSON.stringify(defaultGroups));
                }
            } catch (error) {
                console.error('Error loading muscle groups from storage:', error);
            }
        };

        loadMuscleGroups();
    }, []);

    const openMusclePicker = () => {
        setIsMusclePickerVisible(true);
    };
    const deleteMuscleGroup = (groupToDelete: string) => {
        const updatedMuscleGroups = muscleGroups.filter((group) => group.muscle !== groupToDelete);
        setMuscleGroups(updatedMuscleGroups); // Update the muscle group state
        saveMuscleGroupsLocally(updatedMuscleGroups); // Save updated data to AsyncStorage

        // Remove related working sets from the history
        const updatedWeeklyMuscleGroups = { ...weeklyMuscleGroups };
        Object.keys(updatedWeeklyMuscleGroups).forEach((week) => {
            updatedWeeklyMuscleGroups[week] = updatedWeeklyMuscleGroups[week].filter(
                (item) => item.muscle !== groupToDelete
            );
        });
        setWeeklyMuscleGroups(updatedWeeklyMuscleGroups);
        saveDataLocally(updatedWeeklyMuscleGroups); // Save the updated weekly data

        // Display a success message using Alert for iOS
        Alert.alert('Success', 'Muscle group deleted successfully!');
    };

// State to manage the delete modal
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedGroupToDelete, setSelectedGroupToDelete] = useState('');


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
                headerImage={
                    <Image
                        source={require('@/assets/images/caracal.jpg')}
                        style={styles.caracalImage}
                    />
                }
            >
                <ThemedView style={styles.container}>
                    <ThemedText type="title">Select Date Range</ThemedText>
                    <DateRangePicker
                        selectedRange={selectedRange}
                        onChange={(range) => setSelectedRange(range)}
                    />

                </ThemedView>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Select Muscle Group for Chart</ThemedText>
                    <CustomDropdown
                        items={muscleGroups.map(group => group.muscle)} // Muscle options
                        selectedValue={selectedMuscleForChart} // Current selection
                        onValueChange={setSelectedMuscleForChart} // Update state on selection
                        placeholder="Select Muscle Group for Chart" // Placeholder text
                    />
                    {selectedMuscleForChart && chartData.datasets[0].data.length > 0 ? (
                        <CustomLineChart
                            data={chartData}
                            config={lineChartConfig}
                            width={chartWidth}
                        />
                    ) : (
                        <Text>Gains are waiting!</Text>
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
                <View style={styles.inputContainer}>
                    <CustomDropdown
                        items={muscleGroups.map(group => group.muscle)} // Muscle options
                        selectedValue={selectedMuscle} // Current selection
                        onValueChange={setSelectedMuscle} // Update state on selection
                        placeholder="Select Muscle Group To Add Sets" // Placeholder text
                    />
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
                </View>

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
                        onPress={async () => {
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
                            setMuscleGroups(updatedGroups);

                            // Save the updated muscle groups list to AsyncStorage
                            try {
                                await AsyncStorage.setItem('muscleGroups', JSON.stringify(updatedGroups));
                                console.log('Muscle groups saved locally:', updatedGroups);
                            } catch (error) {
                                console.error('Error saving muscle groups locally:', error);
                            }

                            setNewMuscleGroup(''); // Clear the input
                        }}
                    />
                    <Button
                        title="Delete Muscle Group"
                        onPress={() => setIsDeleteModalVisible(true)}
                        color="red"
                    />
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={isDeleteModalVisible}
                        onRequestClose={() => setIsDeleteModalVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.deleteModalContent}>
                                <Text style={styles.modalTitle}>Select a muscle group to delete:</Text>
                                {muscleGroups.map((group, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedGroupToDelete(group.muscle);
                                            setIsDeleteModalVisible(false);
                                            deleteMuscleGroup(group.muscle);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{group.muscle}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)}>
                                    <Text style={styles.closeButton}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        </Modal>
                </ThemedView>
                <ThemedView style={styles.container}>
                    <Button
                        title="Clear All Data"
                        onPress={() => {
                            Alert.alert(
                                "Clear All Data",
                                "Are you sure you want to clear all set data? This action cannot be undone.",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel",
                                    },
                                    {
                                        text: "Yes, Clear All",
                                        onPress: async () => {
                                            try {
                                                await AsyncStorage.removeItem('weeklyMuscleGroups');
                                                setWeeklyMuscleGroups({});
                                                await AsyncStorage.removeItem('muscleGroups');
                                                setMuscleGroups([
                                                    { muscle: 'Chest', sets: 0 },
                                                    { muscle: 'Back', sets: 0 },
                                                    { muscle: 'Shoulders', sets: 0 },
                                                ]);
                                                console.log("All data cleared successfully.");
                                            } catch (error) {
                                                console.error("Error clearing data:", error);
                                            }
                                        },
                                    },
                                ]
                            );
                        }}
                    />
                </ThemedView>
            </ParallaxScrollView>
        </GestureHandlerRootView>
    );
}
