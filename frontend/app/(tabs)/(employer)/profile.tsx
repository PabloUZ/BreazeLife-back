import { ScrollView } from "react-native";
import ProfileCard from "@/src/components/profile/ProfileCard";

export default function EmployerProfileScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ProfileCard />
    </ScrollView>
  );
}
