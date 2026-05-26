import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { PeriodSelector } from "@/src/components/affiliate/PeriodSelector";
import { QuoteCard } from "@/src/components/affiliate/QuoteCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import { useAuthContext } from "@/src/context/AuthContext";
import type { QuoteResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { getQuotes } from "@/src/services/api/affiliateService";
import { spacing } from "@/src/theme";

export default function AffiliateQuotesScreen() {
  const { state } = useAuthContext();

  const [quotes, setQuotes] = useState<QuoteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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

  const fetchQuotes = useCallback(async (pageNumber: number, shouldReset = false) => {
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
      const data = await getQuotes(
        state.user.user_id,
        pageNumber,
        10,
        from,
        to,
        selectedStatus
      );

      if (shouldReset) {
        setQuotes(data.content);
      } else {
        setQuotes((prev) => [...prev, ...data.content]);
      }

      setHasMore(pageNumber < data.totalPages - 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedPeriod, selectedStatus, state.user?.user_id]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchQuotes(0, true);
  }, [fetchQuotes]);

  function loadMore() {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuotes(nextPage, false);
    }
  }

  return (
    <AffiliateScreenContainer>
      <AppHeader
        title="Mis cotizaciones"
        subtitle="Revisa el estado, los aportes y el detalle de tus cotizaciones."
      />

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        showStatusFilter
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {loading ? (
        <AppLoadingState message="Cargando cotizaciones..." />
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item.quoteId}
          renderItem={({ item }) => <QuoteCard quote={item} />}
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
              title="Sin cotizaciones"
              description="No hay cotizaciones disponibles para estos filtros."
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
