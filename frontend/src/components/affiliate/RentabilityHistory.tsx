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
        <View style={styles.listWrap}>
          <ScrollView
            style={styles.scrollFixedContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {history.map((item, index) => (
              <View
                key={item.id}
                style={[styles.row, index === history.length - 1 ? styles.lastRow : null]}
              >
                <View style={styles.infoContainer}>
                  <Text
                    style={styles.dateText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {new Date(item.date)
                      .toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </Text>
                  <Text
                    style={styles.typeText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Fondo {getAccountTypeLabel(item.accountType)}
                  </Text>
                </View>
                <Text style={styles.profitText}>+ {formatCurrency(item.profit)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: spacing.md,
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
  listWrap: {
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.xs,
  },
  dateText: {
    ...typography.bodyStrong,
    color: colors.text,
    lineHeight: 20,
  },
  typeText: {
    ...typography.body,
    color: colors.neutralText,
    lineHeight: 20,
  },
  profitText: {
    ...typography.cardTitle,
    color: colors.success,
    flexShrink: 0,
    textAlign: "right",
    lineHeight: 22,
  },
  scrollFixedContainer: {
    maxHeight: 250,
  },
  scrollContent: {
    paddingVertical: spacing.xs,
  },
});
