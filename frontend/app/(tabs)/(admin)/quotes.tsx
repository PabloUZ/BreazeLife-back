import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import AdminQuoteCard from "@/src/components/admin/quotes/AdminQuoteCard";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import { getAdminQuotes } from "@/src/services/api/adminQuoteService";
import { sortQuotesForReview } from "@/src/components/admin/quotes/quoteUtils";

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
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando cotizaciones...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Revision de cotizaciones</Text>
        <Text style={styles.subtitle}>
          {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""} para revisar
          y {total} cotizacion{total !== 1 ? "es" : ""} en total.
        </Text>
      </View>

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
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>[]</Text>
            <Text style={styles.emptyTitle}>No pending quotes found</Text>
            <Text style={styles.emptySubtitle}>
              No hay cotizaciones disponibles para revision en este momento.
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color="#369BC9"
              style={styles.footerLoader}
            />
          ) : null
        }
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
  header: {
    marginBottom: 16,
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
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 32,
    color: "#9CA3AF",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
