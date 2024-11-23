// components/MuscleGroupList.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import  styles from '@/styles/styles'; // Adjust import as needed for styles


interface MuscleGroup {
    muscle: string;
    sets: number;
}

interface MuscleGroupListProps {
    muscleGroups: MuscleGroup[];
    setMuscleGroups: (groups: MuscleGroup[]) => void;
    selectedMuscleForChart: string;
    setSelectedMuscleForChart: (muscle: string) => void;
}

const MuscleGroupList: React.FC<MuscleGroupListProps> = ({
                                                             muscleGroups,
                                                             setMuscleGroups,
                                                             selectedMuscleForChart,
                                                             setSelectedMuscleForChart,
                                                         }) => {
    const renderRightActions = (muscle: string) => (
        <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
                onPress={() => {
                    setMuscleGroups(muscleGroups.filter((item) => item.muscle !== muscle)); // Filter correctly by `muscle`
                    if (selectedMuscleForChart === muscle) {
                        setSelectedMuscleForChart('');
                    }
                }}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.inputContainer}>
            {muscleGroups.map((item, index) => (
                <Swipeable key={index} renderRightActions={() => renderRightActions(item.muscle)}>
                    <View style={styles.muscleItemContainer}>
                        <Text style={styles.muscleItemText}>{item.muscle}</Text> {/* Display the muscle name */}
                        <Text style={styles.muscleItemText}>{item.sets} sets</Text> {/* Optionally display sets */}
                    </View>
                </Swipeable>
            ))}
        </View>
    );
};


export default MuscleGroupList;