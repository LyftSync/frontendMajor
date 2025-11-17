import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { COLORS } from "../../constants/colors";

const LoadingOverlay = ({ visible, text = "Loading..." }) => {
  if (!visible) return null;

  return (
    <Modal transparent={true} animationType="none" visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            size="large"
            animating={true}
            color={COLORS.primary}
          />
          <Text style={styles.loadingText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040", // Semi-transparent background
  },
  activityIndicatorWrapper: {
    backgroundColor: COLORS.white,
    height: 120,
    width: 120,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.dark,
  },
});

export default LoadingOverlay;
