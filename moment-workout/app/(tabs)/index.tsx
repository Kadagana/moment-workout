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
import { LineChart } from 'react-native-chart-kit';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
const screenWidth = Dimensions.get("window").width;
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
    const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Quadriceps', 'Biceps', 'Abs', 'Triceps', 'Hamstrings', 'Glutes', 'Calves'];
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
        // Initialize data for all muscle groups with zero sets
        const muscleDataMap = muscleGroups.reduce((acc, muscle) => {
            acc[muscle] = 0; // Default to zero sets for each muscle
            return acc;
        }, {} as Record<string, number>);

        // Update with data from `weekData`
        weekData.forEach((item) => {
            if (muscleDataMap[item.muscle] !== undefined) {
                muscleDataMap[item.muscle] = item.sets; // Update with actual sets
            }
        });

        // Filter out muscle groups with 0 sets
        const filteredData = Object.entries(muscleDataMap).filter(([_, sets]) => sets > 0);

        // Convert filtered data to format for the bar chart
        const labels = filteredData.map(([muscle]) => muscle);
        const data = filteredData.map(([_, sets]) => sets);

        setBarChartData({
            labels: labels,
            datasets: [{ data: data }],
        });
    };
    const lineChartConfig = {
        backgroundColor: 'green',
        backgroundGradientFrom: 'black',
        backgroundGradientTo: 'maroon',
        decimalPlaces: 0,
        color: (opacity = 1) => `black`,
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


    const barChartConfig = {
        backgroundColor: 'black',
        backgroundGradientFrom: 'maroon',
        backgroundGradientTo: 'white',
        decimalPlaces: 0,
        color: (opacity = 0.5) => `black`,
        labelColor: (opacity = 1) => `black`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            stroke: '#e3e3e3',
        },
    };


    const loadLineChartData = async (muscle: string) => {
        // Retrieve data for multiple weeks for the line graph
        const labels: string[] = [];
        const setsData: number[] = [];

        for (let i = 0; i < 20; i++) { // Example: iterate over the past 20 weeks
            const date = new Date();
            date.setDate(date.getDate() - i * 7); // Go back by weeks
            const weekLabel = getWeekLabel(date);

            // Load data for each week
            const weeklyData = await new Promise<WorkingSet[]>((resolve) => {
                getWeekData(weekLabel, (data: WorkingSet[]) => resolve(data || []));
            });

            const muscleData = weeklyData.find((item) => item.muscle === muscle);
            const sets = muscleData ? muscleData.sets : 0;

            labels.unshift(weekLabel); // Add to labels
            setsData.unshift(sets); // Add sets count
        }

        // Update the state for the line chart
        setChartData({
            labels: labels,
            datasets: [{ data: setsData }],
        });
        console.log('Working Sets Data:', workingSets); // Log for debugging purposes
    };

    useEffect(() => {
        if (selectedMuscleForChart) {
            loadLineChartData(selectedMuscleForChart); // Load data for the line chart when a muscle is selected
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
                    setWorkingSets([]); // No data found for the week
                }
                // Load bar chart data after setting `workingSets`
                loadBarChartData(data);
            });
        } catch (error) {
            console.error("Error loading week data:", error);
        }
    };

    const saveMuscleGroups = async (updatedSets: any) => {
        try {
            console.log(`Saving muscle groups for week: ${weekLabel}`, updatedSets);
            await insertData(weekLabel, updatedSets);
        } catch (error) {
            console.error('Error saving muscle groups:', error);
        }
    };

    const updateSet = (muscle: string, newSetCount: number): void => {
        const updatedSets = workingSets.map((item) =>
            item.muscle === muscle ? { ...item, sets: newSetCount } : item
        );
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);
    };

    const addMuscleGroup = () => {
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
        const newGroup = { muscle: selectedMuscle, sets: setsNumber };
        const updatedSets = [...workingSets, newGroup];
        setWorkingSets(updatedSets);
        saveMuscleGroups(updatedSets);
        loadBarChartData(updatedSets);
        setNewSets('');
        setSelectedMuscle('');
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

    const renderRightActions = (muscle: any) => (
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

    interface CustomDropdownProps {
        items: string[];
        selectedValue: string;
        onValueChange: (value: string) => void;
    }

    const CustomDropdown: React.FC<CustomDropdownProps> = ({ items, selectedValue, onValueChange }) => {
        const [isVisible, setIsVisible] = useState(false);

        return (
            <View style={{ marginVertical: 10 }}>
                <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.dropdownButton}>
                    <Text style={styles.dropdownButtonText}>{selectedValue || 'Select an option'}</Text>
                </TouchableOpacity>
                {isVisible && (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setIsVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.dropdownList}>
                                {items.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            onValueChange(item);
                                            setIsVisible(false);
                                        }}
                                        style={styles.dropdownItem}
                                    >
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={() => setIsVisible(false)}>
                                    <Text style={styles.closeButton}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        );
    };

    const CustomLineChart = ({ data, config }) => (
        <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
            <LineChart
                data={data}
                width={screenWidth * 4} // Adjust as needed
                height={300}
                chartConfig={config}
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </ScrollView>
    );

    const CustomBarChart = ({ data, config }) => (
        <ScrollView horizontal contentContainerStyle={{ padding: 10 }}>
            <BarChart
                data={data}
                width={screenWidth * 1.2} // Adjust as needed
                height={300}
                yAxisLabel=""
                yAxisSuffix=" sets"
                yAxisInterval={1}
                chartConfig={config}
                showValuesOnTopOfBars
                fromZero
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </ScrollView>
    );


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
                    <ThemedText type="title">Select Muscle Group for Chart</ThemedText>
                    <CustomDropdown
                        items={muscleGroups}
                        selectedValue={selectedMuscleForChart}
                        onValueChange={setSelectedMuscleForChart}
                    />

                    {selectedMuscleForChart && (
                        <CustomLineChart
                            key={`line-chart-${selectedMuscleForChart}`}
                            data={chartData}
                            config={lineChartConfig}
                        />
                    )}
                </ThemedView>
                <ThemedView style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>
                        Sets per Muscle Group for the Week of {weekLabel}
                    </Text>
                    <CustomBarChart
                        key={`bar-chart-${weekLabel}`}
                        data={barChartData}
                        config={barChartConfig}
                    />
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
                    <Modal
                        transparent={true}
                        visible={isMusclePickerVisible}
                        animationType="slide"
                        onRequestClose={() => setIsMusclePickerVisible(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <CustomDropdown
                                    items={muscleGroups}
                                    selectedValue={selectedMuscle}
                                    onValueChange={setSelectedMuscle}
                                />
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
    chartContainer: {
        marginBottom: 16, // Optional, to create spacing around the chart container
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8, // Space between the title and chart
        color: '#fff', // Adjust color based on your theme
    },
    dropdownButton: {
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        alignItems: 'center',
    },
    dropdownButtonText: {
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownList: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 10,
    },
    dropdownItem: {
        paddingVertical: 10,
    },
    dropdownItemText: {
        color: '#000',
    },
    closeButton: {
        marginTop: 10,
        textAlign: 'center',
        color: 'blue',
    },
    muscleItem: {
        opacity: 1,
        color: 'black'
    },
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
