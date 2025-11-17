import React from "react";
import { Button } from "react-native-paper";
import { COLORS } from "../../constants/colors";

const AppButton = ({
  title,
  onPress,
  style,
  textStyle,
  color = "primary",
  disabled,
  loading,
}) => {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={COLORS[color]}
      textColor={COLORS.white}
      style={[{ marginBottom: 15 }, style]}
      labelStyle={textStyle}
    >
      {title}
    </Button>
  );
};

export default AppButton;
