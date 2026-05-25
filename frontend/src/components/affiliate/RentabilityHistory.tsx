import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import AppCard from "@/src/components/common/AppCard";
import { useAuthContext } from "@/src/context/AuthContext";
import type { ProfitabilityResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getRentabilities } from "@/src/services/api/affiliateService";
import { colors, spacing, typography } from "@/src/theme";

export function RentabilityHistory() {
  const { state } = useAuthContext();
  const [history, setHistory] = useState<ProfitabilityResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!state.user?.user_id) return;
      try {
        const data = await getRentabilities(state.user.user_id, 0, 20);
        setHistory(data.content);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [state.user?.user_id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "CONSERVATIVE":
        return "Conservador";
      case "MODERATE":
        return "Moderado";
      case "RISKY":
        return "Arriesgado";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <AppCard style={styles.container}>
        <ActivityIndicator size="small" color={colors.success} style={styles.loader} />
      </AppCard>
    );
  }

  return (
    <AppCard style={styles.container}>
      <Text style={styles.title}>Rendimientos generados</Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>Aun no tienes rendimientos aplicados.</Text>
      ) : (
        <View>
          <ScrollView
            style={styles.scrollFixedContainer}
            showsVerticalScrollIndicator
          >
            {history.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.infoContainer}>
                  <Text style={styles.dateText}>
                    {new Date(item.date)
                      .toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </Text>
                  <Text style={styles.typeText}>
                    Fondo {getAccountTypeLabel(item.accountType)}
                  </Text>
                </View>
                <Text style={styles.profitText}>+ {formatCurrency(item.profit)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.fadeOverlay} pointerEvents="none" />
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoContainer: {
    flex: 1,
  },
  dateText: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  typeText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  profitText: {
    ...typography.cardTitle,
    color: colors.success,
    flexShrink: 1,
    textAlign: "right",
  },
  scrollFixedContainer: {
    maxHeight: 250,
  },
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
});
