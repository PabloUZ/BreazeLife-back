import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useAuthContext } from "@/src/context/AuthContext";
import { getRentabilities } from "@/src/services/api/affiliateService";
import { ProfitabilityResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";

export const RentabilityHistory = () => {
  const { state } = useAuthContext();
  const [history, setHistory] = useState<ProfitabilityResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!state.user?.user_id) return;
      try {
        const data = await getRentabilities(state.user.user_id, 0, 20);
        setHistory(data.content);
      } catch (error) {
        console.error("Error fetching rentabilities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [state.user?.user_id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSERVATIVE': return 'Conservador';
      case 'MODERATE': return 'Moderado';
      case 'RISKY': return 'Arriesgado';
      default: return type;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#16a34a" style={styles.loader} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rendimientos Generados</Text>
      
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Aún no tienes rendimientos aplicados.</Text>
      ) : (
        <View>
          <ScrollView 
            style={styles.scrollFixedContainer}
            showsVerticalScrollIndicator={true}
          >
            {history.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.infoContainer}>
                  <Text style={styles.dateText}>
                    {new Date(item.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </Text>
                  <Text style={styles.typeText}>Fondo {getAccountTypeLabel(item.accountType)}</Text>
                </View>
                <Text style={styles.profitText}>+ {formatCurrency(item.profit)}</Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Pista visual (Fade Out) para indicar que hay más contenido */}
          <View style={styles.fadeOverlay} pointerEvents="none" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden', // Necesario para que el fade no se salga de las esquinas redondeadas
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  loader: { marginVertical: 20 },
  emptyText: { color: "#64748b", fontStyle: "italic", textAlign: "center", marginTop: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoContainer: { flex: 1 },
  dateText: { fontSize: 14, fontWeight: "bold", color: "#334155" },
  typeText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  profitText: { fontSize: 16, fontWeight: "bold", color: "#16a34a", marginLeft: 10 },
  scrollFixedContainer: {
    maxHeight: 250,
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});