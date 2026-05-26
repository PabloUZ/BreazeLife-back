import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import ProfitabilityHistoryCard from "@/src/components/admin/profitability/ProfitabilityHistoryCard";
import ApplyProfitabilityModal from "@/src/components/admin/profitability/ApplyProfitabilityModal";
import { useProfitability } from "@/src/hooks/useProfitability";
import { useSystemConfigContext, formatRate } from "@/src/context/SystemConfigContext";

export default function AdminProfitabilityScreen() {
  const {
    error, history, isApplying, isEmpty, isLoading,
    isRefreshing, applyProfitability, refresh,
  } = useProfitability();
  const { config, reload: reloadConfig } = useSystemConfigContext();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    setShowModal(false);
    await applyProfitability();
  };

  // Al hacer pull-to-refresh también actualiza las tasas del context
  const handleRefresh = async () => {
    await Promise.all([refresh(), reloadConfig()]);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>
            Cargando historial de rentabilidades...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rentabilidad mensual</Text>
            <Text style={styles.subtitle}>
              Aplica la rentabilidad a todos los afiliados o consulta el
              historial por período.
            </Text>
          </View>
        </View>

        {/* Card de acción principal */}
        <View style={styles.actionCard}>
          <View style={styles.actionCardLeft}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="flash" size={22} color="#10B981" />
            </View>
            <View style={styles.actionCardText}>
              <Text style={styles.actionTitle}>Aplicar este mes</Text>
              <Text style={styles.actionSubtitle}>
                Acredita rentabilidad{"\n"}a todos los fondos activos
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
            onPress={() => setShowModal(true)}
            disabled={isApplying}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyButtonText}>Aplicar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tasas de referencia */}
        <View style={styles.ratesCard}>
          <Text style={styles.ratesCardTitle}>Tasas mensuales vigentes</Text>
          <View style={styles.ratesRow}>
            <View style={styles.rateItem}>
              <View style={[styles.rateBadge, { backgroundColor: "#EFF6FF" }]}>
                <Text style={[styles.rateBadgeText, { color: "#3B82F6" }]}>
                  {formatRate(config.rate_conservative)}
                </Text>
              </View>
              <Text style={styles.rateItemLabel}>Conservador</Text>
            </View>
            <View style={styles.rateItem}>
              <View style={[styles.rateBadge, { backgroundColor: "#FFFBEB" }]}>
                <Text style={[styles.rateBadgeText, { color: "#F59E0B" }]}>
                  {formatRate(config.rate_moderate)}
                </Text>
              </View>
              <Text style={styles.rateItemLabel}>Moderado</Text>
            </View>
            <View style={styles.rateItem}>
              <View style={[styles.rateBadge, { backgroundColor: "#FEF2F2" }]}>
                <Text style={[styles.rateBadgeText, { color: "#EF4444" }]}>
                  {formatRate(config.rate_risky)}
                </Text>
              </View>
              <Text style={styles.rateItemLabel}>Mayor riesgo</Text>
            </View>
          </View>
        </View>

        {/* Historial */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historial de aplicaciones</Text>
          <Text style={styles.sectionCount}>
            {history.length} período{history.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyBanner}>
            <Ionicons name="time-outline" size={32} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sin historial aún</Text>
            <Text style={styles.emptySubtitle}>
              Cuando apliques la primera rentabilidad mensual, aparecerá aquí el
              registro por período.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((item) => (
              <ProfitabilityHistoryCard key={item.applied_at} item={item} />
            ))}
          </View>
        )}
      </ScrollView>

      <ApplyProfitabilityModal
        visible={showModal}
        isApplying={isApplying}
        rateConservative={config.rate_conservative}
        rateModerate={config.rate_moderate}
        rateRisky={config.rate_risky}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  actionCardText: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  applyButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  ratesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  ratesCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  ratesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  rateItem: {
    alignItems: "center",
    gap: 6,
  },
  rateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rateBadgeText: {
    fontSize: 16,
    fontWeight: "800",
  },
  rateItemLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  sectionCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyBanner: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  historyList: {
    gap: 12,
  },
});

