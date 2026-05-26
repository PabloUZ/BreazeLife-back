import { ScrollView } from "react-native";
import ProfileCard from "@/src/components/profile/ProfileCard";
import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";

export default function EmployerProfileScreen() {
  return (
    <EmployerScreenContainer>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard />
      </ScrollView>
    </EmployerScreenContainer>
  );
}
