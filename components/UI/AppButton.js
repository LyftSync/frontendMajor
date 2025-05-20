import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../../constants/colors";

const AppButton = ({ title, onPress, style, textStyle, color = "primary", disabled, loading }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: COLORS[color] }, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.7,
  }
});

export default AppButton;
