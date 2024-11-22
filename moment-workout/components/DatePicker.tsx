import React, { useState } from 'react';
import { View, Button, Platform, Modal, StyleSheet, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (event: any, date: Date | undefined) => {
        if (date) {
            onDateChange(date);
        }
        if (Platform.OS !== 'ios') {
            setShowPicker(false); // Close picker for Android after selection
        }
    };

    return (
        <View>
            <Button title="Select Date" onPress={() => setShowPicker(true)} />
            {showPicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent={true}
                        animationType="slide"
                        visible={showPicker}
                        onRequestClose={() => setShowPicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.pickerContainer}>
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => {
                                        handleDateChange(event, date);
                                    }}
                                    textColor="black"
                                />
                                <Button title="Done" onPress={() => setShowPicker(false)} />
                            </View>
                        </View>
                    </Modal>
                ) : Platform.OS === 'web' ? (
                    <TextInput
                        // type="date"
                        style={styles.dateInput}
                        value={selectedDate.toISOString().substring(0, 10)}
                        onChange={(e) => handleDateChange(null, new Date(e.target.value))}
                    />
                ) : (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            handleDateChange(event, date);
                        }}
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 8,
        borderRadius: 5,
        backgroundColor: 'white',
        marginTop: 10,
    },
});

export default DatePicker;
