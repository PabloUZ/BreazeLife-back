import { ScrollView } from "react-native";
import ProfileCard from "@/src/components/profile/ProfileCard";

export default function AffiliateProfileScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ProfileCard />
    </ScrollView>
  );
}
