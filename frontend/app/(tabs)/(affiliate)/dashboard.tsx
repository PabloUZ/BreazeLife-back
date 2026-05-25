// app/(tabs)/(affiliate)/dashboard.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import PensionProgressWidget from "@/src/components/affiliate/PensionProgressWidget";
import { getAffiliateProgress } from "@/src/services/api/affiliateService";
import type { ProgressResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";

// Importa tu hook de autenticación
import { useAuthContext } from "@/src/context/AuthContext"; 

export default function AffiliateDashboardScreen() {
  const { state } = useAuthContext(); // Extraemos el estado global
  const [progressData, setProgressData] = useState<ProgressResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Si por alguna razón no hay usuario en sesión, cancelamos
      if (!state.user?.user_id) return;

      try {
        setLoading(true);
        // Usamos el ID dinámico del usuario logueado
        const affiliateId = state.user.user_id; 
        
        const data = await getAffiliateProgress(affiliateId);
        setProgressData(data);
      } catch (error) {
        console.error("Error fetching progress:", error);
        Alert.alert("Error", "No pudimos cargar tu progreso pensional.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [state.user?.user_id]); // El efecto depende del user_id

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando tu información...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Mi Dashboard</Text>
      
      {/* Saludo personalizado usando el nombre del estado */}
      <Text style={styles.welcomeText}>
        Hola, {state.user?.first_name}
      </Text>
      
      {/* Widget de la BLIFE-14 */}
      {progressData ? (
        <PensionProgressWidget data={progressData} />
      ) : (
        <Text style={styles.errorText}>No hay datos de progreso disponibles.</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 20,
  },
});