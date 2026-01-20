import React from 'react';
import { Text } from 'react-native';

const MarkdownText = ({ children, style }: { children: string; style?: any }) => {
    const parts = children.split(/(\*\*.*?\*\*)/g);
    return (
        <Text style={style}>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={index} style={{ fontWeight: '700' }}>
                            {part.slice(2, -2)}
                        </Text>
                    );
                }
                return <Text key={index}>{part}</Text>;
            })}
        </Text>
    );
};

export default MarkdownText;
