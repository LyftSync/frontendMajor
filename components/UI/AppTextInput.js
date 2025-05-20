import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";
import { COLORS } from "../../constants/colors";

const AppTextInput = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, error && styles.inputError]} {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: COLORS.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 2,
  },
});

export default AppTextInput;
