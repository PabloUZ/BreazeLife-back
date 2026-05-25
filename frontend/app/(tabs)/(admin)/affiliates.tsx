import { useCallback, useRef, useState } from "react";
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
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
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
      <AdminScreenContainer>
        <AppLoadingState message="Cargando cuentas..." />
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
        title="Gestion de cuentas"
        subtitle={`Administra ${total} cuenta${total !== 1 ? "s" : ""} de afiliados y empleadores desde una sola vista.`}
      />

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
          <AppEmptyState
            title="No se encontraron cuentas"
            description="No hay cuentas administrables disponibles en este momento."
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
