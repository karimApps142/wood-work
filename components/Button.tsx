// components/Button.tsx
import React from 'react';
import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
    title: string;
    disabled?: boolean,
    onPress: (event: GestureResponderEvent) => void;
    variant?: 'primary' | 'secondary';
}

const Button = ({ title, onPress, disabled, variant = 'primary' }: ButtonProps) => {
    const bgColor = variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500';

    return (
        <TouchableOpacity
            className={`${bgColor} rounded-lg p-3 my-2`}
            disabled={disabled}
            onPress={onPress}
        >
            <Text className="text-white text-center font-bold">{title}</Text>
        </TouchableOpacity>
    );
};

export default Button;