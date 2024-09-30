import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to insert data for a specific week
export const insertData = async (week, workingSets) => {
    try {
        await AsyncStorage.setItem(week, JSON.stringify(workingSets));
        console.log(`Data for ${week} saved successfully.`);
    } catch (error) {
        console.error("Error inserting data:", error);
    }
};

// Function to retrieve data for a specific week
export const getWeekData = async (week, callback) => {
    try {
        const jsonValue = await AsyncStorage.getItem(week);
        const data = jsonValue != null ? JSON.parse(jsonValue) : [];
        callback(data);
        console.log(`Data for ${week} retrieved successfully.`);
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
};

// Function to clear data for a specific week
export const clearWeekData = async (week) => {
    try {
        await AsyncStorage.removeItem(week);
        console.log(`Data for ${week} cleared.`);
    } catch (error) {
        console.error("Error clearing data:", error);
    }
};
