import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { Colors } from '../theme/colors';

interface Props {
    label: string;
    onPress: () => void;
  }

export const CustomButton = ({label, onPress}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor:  Colors.secondary,
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
      }}>
      <Text
        style={{
          textAlign: 'center',
          fontWeight: '700',
          fontSize: 16,
          color: '#fff',
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}
