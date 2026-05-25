import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AdminQuoteCard from "@/src/components/admin/quotes/AdminQuoteCard";
import { sortQuotesForReview } from "@/src/components/admin/quotes/quoteUtils";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import { getAdminQuotes } from "@/src/services/api/adminQuoteService";

const PAGE_SIZE = 20;

function mapErrorToMessage(error: ApiErrorResponseDto): string {
  if (error.status_code === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }
  if (error.status_code === 403) {
    return "No tienes permisos para ver las cotizaciones administrativas.";
  }

  return error.message || "No se pudo cargar la lista de cotizaciones.";
}

export default function AdminQuotesScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [quotes, setQuotes] = useState<AdminQuoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  const sortedQuotes = useMemo(() => sortQuotesForReview(quotes), [quotes]);
  const pendingCount = useMemo(
    () => quotes.filter((quote) => quote.status === "PENDING").length,
    [quotes]
  );

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesion expirada",
      "Tu sesion expiro. Inicia sesion nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const fetchQuotes = useCallback(
    async (page: number, replace: boolean) => {
      try {
        if (replace) {
          if (page === 1 && hasLoadedOnceRef.current) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const response = await getAdminQuotes({
          page,
          limit: PAGE_SIZE,
        });

        setQuotes((previous) =>
          replace ? response.quotes : [...previous, ...response.quotes]
        );
        setCurrentPage(page);
        setTotal(response.pagination?.total ?? response.quotes.length);
        hasLoadedOnceRef.current = true;

        const totalResults = response.pagination?.total ?? response.quotes.length;
        setHasMore(page * PAGE_SIZE < totalResults);
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (apiError.status_code === 401) {
          await handleUnauthorized();
          return;
        }

        setError(mapErrorToMessage(apiError));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [handleUnauthorized]
  );

  useFocusEffect(
    useCallback(() => {
      fetchQuotes(1, true);
    }, [fetchQuotes])
  );

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    fetchQuotes(currentPage + 1, false);
  };

  const handleRetry = () => {
    fetchQuotes(1, true);
  };

  if (loading) {
    return (
      <AdminScreenContainer>
        <AppLoadingState message="Cargando cotizaciones..." />
      </AdminScreenContainer>
    );
  }

  if (error) {
    return (
      <AdminScreenContainer>
        <AppErrorState message={error} onRetry={handleRetry} />
      </AdminScreenContainer>
    );
  }

  return (
    <AdminScreenContainer>
      <AppHeader
        title="Revision de cotizaciones"
        subtitle={`${pendingCount} pendiente${pendingCount !== 1 ? "s" : ""} por revisar y ${total} cotizacion${total !== 1 ? "es" : ""} disponibles.`}
      />

      <FlatList
        data={sortedQuotes}
        keyExtractor={(item) => item.quoteId}
        renderItem={({ item }) => (
          <AdminQuoteCard
            quote={item}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/(admin)/quote-detail",
                params: { quoteId: item.quoteId },
              })
            }
          />
        )}
        contentContainerStyle={
          sortedQuotes.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshing={refreshing}
        onRefresh={handleRetry}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppEmptyState
            title="No hay cotizaciones para revisar"
            description="Cuando existan cotizaciones disponibles para revision, apareceran aqui."
          />
        }
        ListFooterComponent={loadingMore ? <View style={styles.footerLoader} /> : null}
      />
    </AdminScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footerLoader: {
    height: 16,
  },
});
