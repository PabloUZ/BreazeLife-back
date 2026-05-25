import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { PaymentCard } from "@/src/components/affiliate/PaymentCard";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import DateRangeFilter from "@/src/components/fund/DateRangeFilter";
import type { AffiliatePaymentItemDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getAffiliatePayments } from "@/src/services/api/affiliateService";
import { colors, spacing, typography } from "@/src/theme";

const STATUS_CHIPS = [
  { label: "Todos", value: "" },
  { label: "Procesados", value: "PROCESSED" },
  { label: "Pendientes", value: "PENDING" },
];

export default function AffiliatePaymentsScreen() {
  const router = useRouter();

  const [payments, setPayments] = useState<AffiliatePaymentItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPayments = async (pageNumber: number, shouldReset = false) => {
    try {
      if (shouldReset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const res = await getAffiliatePayments({
        page: pageNumber,
        limit: 10,
        from: fromDate || undefined,
        to: toDate || undefined,
        status: selectedStatus || undefined,
      });

      const historyData = res.data;
      const fetchedItems = historyData.items || [];
      const totalPages = historyData.pagination.total_pages;

      if (shouldReset) {
        setPayments(fetchedItems);
      } else {
        setPayments((prev) => [...prev, ...fetchedItems]);
      }

      setPage(pageNumber);
      setTotalItems(historyData.pagination.total_items);
      setHasMore(pageNumber < totalPages);
    } catch {
      setError("No se pudo cargar el historial de pagos. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, true);
  }, [fromDate, toDate, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchPayments(1, true);
    }, [])
  );

  const handleDateRangeApply = (from: string | undefined, to: string | undefined) => {
    setFromDate(from);
    setToDate(to);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPayments(page + 1, false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AffiliateScreenContainer>
        <AppHeader
          title="Pagos recibidos"
          subtitle="Consulta tu historial de pagos y revisa el desglose de cada periodo."
        />

        <DateRangeFilter onApply={handleDateRangeApply} />

        <AppCard compact>
          <Text style={styles.filterLabel}>Filtrar por estado</Text>
          <View style={styles.statusRow}>
            {STATUS_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                style={[
                  styles.statusChip,
                  selectedStatus === chip.value && styles.statusChipActive,
                ]}
                onPress={() => setSelectedStatus(chip.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedStatus === chip.value && styles.statusChipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.resultsCount}>
            {totalItems} {totalItems === 1 ? "pago encontrado" : "pagos encontrados"}
          </Text>
        </AppCard>

        {loading ? (
          <AppLoadingState message="Buscando tus pagos recibidos..." />
        ) : error ? (
          <AppErrorState message={error} onRetry={() => fetchPayments(1, true)} />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item) => item.payment_id}
            renderItem={({ item }) => (
              <PaymentCard
                payment={item}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/(affiliate)/payment-detail",
                    params: { paymentId: item.payment_id },
                  } as any)
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.footerLoader}
                />
              ) : (
                <View style={styles.bottomSpacing} />
              )
            }
            ListEmptyComponent={
              <AppEmptyState
                title="Sin pagos"
                description="No tienes pagos registrados para este periodo o estado."
              />
            }
          />
        )}
      </AffiliateScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  filterLabel: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.primary,
  },
  statusChipText: {
    ...typography.caption,
    color: colors.neutralText,
  },
  statusChipTextActive: {
    color: colors.primary,
  },
  resultsCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.section,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});
