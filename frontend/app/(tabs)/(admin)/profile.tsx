import { ScrollView } from "react-native";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import ProfileCard from "@/src/components/profile/ProfileCard";

export default function AdminProfileScreen() {
  return (
    <AdminScreenContainer>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard />
      </ScrollView>
    </AdminScreenContainer>
  );
}
