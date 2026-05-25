import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { PayslipCard } from "@/src/components/affiliate/PayslipCard";
import { PeriodSelector } from "@/src/components/affiliate/PeriodSelector";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { PayslipDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getPayslips } from "@/src/services/api/affiliateService";
import { spacing } from "@/src/theme";

export default function AffiliateContributionsScreen() {
  const { state } = useAuthContext();

  const [payslips, setPayslips] = useState<PayslipDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  function getDateRange(yearMonth: string) {
    if (!yearMonth) {
      return { from: undefined, to: undefined };
    }

    const [year, month] = yearMonth.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();

    return {
      from: `${yearMonth}-01`,
      to: `${yearMonth}-${lastDay}`,
    };
  }

  const fetchPayslips = useCallback(async (pageNumber: number, shouldReset = false) => {
    if (!state.user?.user_id) {
      return;
    }

    try {
      if (shouldReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { from, to } = getDateRange(selectedPeriod);
      const data = await getPayslips(state.user.user_id, pageNumber, 10, from, to);

      if (shouldReset) {
        setPayslips(data.content);
      } else {
        setPayslips((prev) => [...prev, ...data.content]);
      }

      setHasMore(pageNumber < data.totalPages - 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedPeriod, state.user?.user_id]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPayslips(0, true);
  }, [fetchPayslips]);

  function loadMore() {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayslips(nextPage, false);
    }
  }

  return (
    <AffiliateScreenContainer>
      <AppHeader
        title="Historial de colillas"
        subtitle="Consulta tus desprendibles y el detalle de los aportes aplicados."
      />

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      {loading ? (
        <AppLoadingState message="Cargando colillas..." />
      ) : (
        <FlatList
          data={payslips}
          keyExtractor={(item, index) =>
            item.period
              ? `${item.affiliateDocument}-${item.period}-${index}`
              : index.toString()
          }
          renderItem={({ item }) => <PayslipCard payslip={item} />}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={styles.footerLoader}
              />
            ) : null
          }
          ListEmptyComponent={
            <AppEmptyState
              title="Sin colillas"
              description="No se encontraron colillas para el periodo seleccionado."
            />
          }
        />
      )}
    </AffiliateScreenContainer>
  );
}

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: 20,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
});
