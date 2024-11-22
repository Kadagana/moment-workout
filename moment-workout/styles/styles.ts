import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    deleteButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red',
        paddingHorizontal: 20,
        borderRadius: 5,
        height: '100%', // Match the height of the swipeable item
    },
    muscleItemContainer: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        marginVertical: 5,
        borderRadius: 5,
    },
    muscleItemText: {
        fontSize: 16,
        color: 'black',
    },
    newMuscleInput: {
        height: 40,
        color: 'white',
        backgroundColor: '#333',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
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
    container: {
        padding: 16,
    },
    datePickerContainer: {
        marginTop: 10,
    },
});
export default styles;