// components/Card.tsx
import React, { PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';

type CardProps = PropsWithChildren<{
    style?: ViewStyle;
}>;

const Card = ({ children, style }: CardProps) => {
    return (
        <View
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 my-2"
            style={style}
        >
            {children}
        </View>
    );
};

export default Card;