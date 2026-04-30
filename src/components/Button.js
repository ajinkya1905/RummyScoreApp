import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
}) {
  const buttonStyles = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.primary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.surface,
  },
  ghostText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
