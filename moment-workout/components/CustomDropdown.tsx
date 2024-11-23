// components/CustomDropdown.tsx
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import  styles  from '@/styles/styles'; // Adjust import as needed for styles

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

export default CustomDropdown;
