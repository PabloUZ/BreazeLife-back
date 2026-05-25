import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { useAuthContext } from "@/src/context/AuthContext";
import { getPayslips } from "@/src/services/api/affiliateService";
import type { PayslipDto } from "@/src/dtos/affiliate/affiliate.dtos";

import { PayslipCard } from "@/src/components/affiliate/PayslipCard";
import { PeriodSelector } from "@/src/components/affiliate/PeriodSelector";

export default function AffiliateContributionsScreen() {
  const { state } = useAuthContext();
  
  const [payslips, setPayslips] = useState<PayslipDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); // Formato: "YYYY-MM"
  
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Helper matemático para sacar el primer y último día del mes
  const getDateRange = (yearMonth: string) => {
    if (!yearMonth) return { from: undefined, to: undefined };
    
    const [year, month] = yearMonth.split('-');
    const lastDay = new Date(Number(year), Number(month), 0).getDate(); // Obtiene el último día real del mes
    
    return {
      from: `${yearMonth}-01`,
      to: `${yearMonth}-${lastDay}`
    };
  };

  const fetchPayslips = async (pageNumber: number, shouldReset: boolean = false) => {
    if (!state.user?.user_id) return;
    
    try {
      if (shouldReset) setLoading(true);
      else setLoadingMore(true);

      const { from, to } = getDateRange(selectedPeriod);

      // ¡Le pasamos el from y to a tu backend!
      const data = await getPayslips(state.user.user_id, pageNumber, 10, from, to);
      
      if (shouldReset) {
        setPayslips(data.content);
      } else {
        setPayslips(prev => [...prev, ...data.content]);
      }

      setHasMore(pageNumber < data.totalPages - 1);
      
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPayslips(0, true);
  }, [state.user?.user_id, selectedPeriod]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayslips(nextPage, false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Historial de Colillas</Text>

      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        onSelectPeriod={setSelectedPeriod} 
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : (
        <FlatList
          // Ya no filtramos localmente, usamos la lista directamente del backend
          data={payslips} 
          keyExtractor={(item, index) => item.period ? `${item.affiliateDocument}-${item.period}-${index}` : index.toString()}
          renderItem={({ item }) => <PayslipCard payslip={item} />}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#2563eb" style={styles.footerLoader} /> : null}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron colillas para este periodo.</Text>
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