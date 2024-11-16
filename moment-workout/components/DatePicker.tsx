import React, { useState } from 'react';
import { View, Button, Platform } from 'react-native';
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
    };

    return (
        <View>
            <Button title="Select Date" onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
};

export default DatePicker;
