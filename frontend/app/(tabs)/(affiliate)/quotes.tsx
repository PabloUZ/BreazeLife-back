import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useAuthContext } from "@/src/context/AuthContext";
import type { QuoteResponseDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { QuoteCard } from "@/src/components/affiliate/QuoteCard";
import { PeriodSelector } from "@/src/components/affiliate/PeriodSelector";
import { getQuotes } from "@/src/services/api/affiliateService";

export default function AffiliateQuotesScreen() {
  const { state } = useAuthContext();
  
  const [quotes, setQuotes] = useState<QuoteResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  // Estados para los Filtros
  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); 
  const [selectedStatus, setSelectedStatus] = useState<string>(""); 
  
  // Paginación
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getDateRange = (yearMonth: string) => {
    if (!yearMonth) return { from: undefined, to: undefined };
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return {
      from: `${yearMonth}-01`,
      to: `${yearMonth}-${lastDay}`
    };
  };

  const fetchQuotes = async (pageNumber: number, shouldReset: boolean = false) => {
    if (!state.user?.user_id) return;
    try {
      if (shouldReset) setLoading(true);
      else setLoadingMore(true);

      const { from, to } = getDateRange(selectedPeriod);

      const data = await getQuotes(state.user.user_id, pageNumber, 10, from, to, selectedStatus);
      
      if (shouldReset) {
        setQuotes(data.content);
      } else {
        setQuotes(prev => [...prev, ...data.content]);
      }

      setHasMore(pageNumber < data.totalPages - 1);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchQuotes(0, true);
  }, [state.user?.user_id, selectedPeriod, selectedStatus]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuotes(nextPage, false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Mis Cotizaciones</Text>

      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        onSelectPeriod={setSelectedPeriod} 
        showStatusFilter={true} // ¡Activamos el nuevo filtro aquí!
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : (
        <FlatList
          data={quotes} 
          keyExtractor={(item) => item.quoteId}
          renderItem={({ item }) => <QuoteCard quote={item} />}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#2563eb" style={styles.footerLoader} /> : null}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay cotizaciones para estos filtros.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#0f172a", margin: 20 },
  loader: { marginTop: 40 },
  footerLoader: { paddingVertical: 20 },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 20 },
});