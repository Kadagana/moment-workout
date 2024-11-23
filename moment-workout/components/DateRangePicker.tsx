import { StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
interface DateRangePickerProps {
    selectedRange: string;
    onChange: (range: string) => void;
}
const DateRangePicker: React.FC<DateRangePickerProps> = ({ selectedRange, onChange }) => {
    return (
        <View style={styles.centeredContainer}>
            <Picker
                selectedValue={selectedRange}
                onValueChange={onChange}
                style={styles.pickerStyle}
            >
                <Picker.Item label="Past Month" value="1_month" />
                <Picker.Item label="Past 3 Months" value="3_months" />
                <Picker.Item label="Past 6 Months" value="6_months" />
                <Picker.Item label="Past Year" value="1_year" />
            </Picker>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1, // Take full screen space
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
    },
    pickerStyle: {
        height: 150,
        width: 200,
    },
});

export default DateRangePicker;
