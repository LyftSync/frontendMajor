import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

const AppTextInput = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      <TextInput label={label} error={!!error} mode="outlined" {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
});

export default AppTextInput;
