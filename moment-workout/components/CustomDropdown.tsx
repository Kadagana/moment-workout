import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import styles from '@/styles/styles'; // Adjust import as needed for styles

interface CustomDropdownProps {
    items: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    placeholder?: string; // Placeholder prop
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ items, selectedValue, onValueChange, placeholder = 'Select an option' }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <View style={{ marginVertical: 10 }}>
            <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>
                    {selectedValue || placeholder} {/* Use placeholder if no selection */}
                </Text>
            </TouchableOpacity>
            {isVisible && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.dropdownList}>
                            {/* Placeholder item (non-selectable) */}
                            {!selectedValue && (
                                <TouchableOpacity
                                    onPress={() => {}}
                                    style={[styles.dropdownItem, styles.placeholderItem]}
                                    disabled={true}
                                >
                                    <Text style={styles.placeholderText}>{placeholder}</Text>
                                </TouchableOpacity>
                            )}
                            {/* Render dropdown items */}
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
                            <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButtonContainer}>
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
