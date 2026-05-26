import { Stack } from "expo-router";

export default function PayrollLayout() {
  return (
    <Stack
      initialRouteName="payroll"
      screenOptions={{ headerShown: false }}
    />
  );
}
