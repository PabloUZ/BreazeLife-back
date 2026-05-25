import { useCallback, useRef, useState } from "react";
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
import AdminAccountCard from "@/src/components/admin/accounts/AdminAccountCard";
import type { AdminAccountListItemDto } from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import { listAdminAccounts } from "@/src/services/api/adminAccountService";

const PAGE_SIZE = 20;

function mapErrorToMessage(error: ApiErrorResponseDto): string {
  if (error.status_code === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }
  if (error.status_code === 403) {
    return "No tienes permisos para ver las cuentas administrativas.";
  }

  return error.message || "No se pudo cargar la lista de cuentas. Intenta de nuevo.";
}

export default function AdminAffiliatesScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccountListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesion expirada",
      "Tu sesion expiro. Inicia sesion nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const fetchAccounts = useCallback(
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

        const response = await listAdminAccounts({
          page,
          limit: PAGE_SIZE,
        });

        setAccounts((previous) =>
          replace ? response.accounts : [...previous, ...response.accounts]
        );
        setCurrentPage(page);
        setTotal(response.pagination?.total ?? response.accounts.length);
        hasLoadedOnceRef.current = true;

        const totalResults = response.pagination?.total ?? response.accounts.length;
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
      fetchAccounts(1, true);
    }, [fetchAccounts])
  );

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasMore) return;
    fetchAccounts(currentPage + 1, false);
  };

  const handleRetry = () => {
    fetchAccounts(1, true);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando cuentas...</Text>
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
        <Text style={styles.title}>Gestion de cuentas</Text>
        <Text style={styles.subtitle}>
          Administra {total} cuenta{total !== 1 ? "s" : ""} de afiliados y
          empleadores desde una sola vista.
        </Text>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <AdminAccountCard
            account={item}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/(admin)/account-detail",
                params: { userId: item.userId },
              })
            }
          />
        )}
        contentContainerStyle={
          accounts.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshing={refreshing}
        onRefresh={handleRetry}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>[]</Text>
            <Text style={styles.emptyTitle}>No se encontraron cuentas</Text>
            <Text style={styles.emptySubtitle}>
              No hay cuentas administrables disponibles en este momento.
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
    gap: 6,
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
