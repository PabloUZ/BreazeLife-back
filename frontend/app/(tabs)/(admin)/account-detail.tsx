import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import AdminAccountActions from "@/src/components/admin/accounts/AdminAccountActions";
import AdminAccountDetail from "@/src/components/admin/accounts/AdminAccountDetail";
import { getAccountDisplayName } from "@/src/components/admin/accounts/accountUtils";
import SuspendAccountModal from "@/src/components/admin/accounts/SuspendAccountModal";
import type { AdminAccountDetailDto } from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import {
  activateAdminAccount,
  getAdminAccountById,
  suspendAdminAccount,
  verifyAdminAccount,
} from "@/src/services/api/adminAccountService";

function mapErrorToMessage(error: ApiErrorResponseDto): string {
  if (error.status_code === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }
  if (error.status_code === 403) {
    return "No tienes permisos para gestionar esta cuenta.";
  }
  if (error.status_code === 404) {
    return "Cuenta no encontrada.";
  }

  return error.message || "No se pudo cargar la cuenta. Intenta de nuevo.";
}

export default function AdminAccountDetailScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [account, setAccount] = useState<AdminAccountDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesion expirada",
      "Tu sesion expiro. Inicia sesion nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const handleGoBack = useCallback(() => {
    router.replace("/(tabs)/(admin)/affiliates");
  }, [router]);

  const fetchAccountDetail = useCallback(async () => {
    if (!userId) {
      setError("Cuenta no encontrada.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAccountById(userId);
      setAccount(data);
    } catch (rawError) {
      const apiError = rawError as ApiErrorResponseDto;

      if (apiError.status_code === 401) {
        await handleUnauthorized();
        return;
      }

      setError(mapErrorToMessage(apiError));
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAccountDetail();
    }, [fetchAccountDetail])
  );

  const runAccountAction = useCallback(
    async (
      action: () => Promise<unknown>,
      successTitle: string,
      successMessage: string
    ) => {
      try {
        setActionLoading(true);
        await action();
        await fetchAccountDetail();
        Alert.alert(successTitle, successMessage);
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (apiError.status_code === 401) {
          await handleUnauthorized();
          return;
        }

        Alert.alert("Error", mapErrorToMessage(apiError));
      } finally {
        setActionLoading(false);
      }
    },
    [fetchAccountDetail, handleUnauthorized]
  );

  const confirmVerify = () => {
    if (!account) return;

    Alert.alert(
      "Verificar cuenta",
      `Confirma la verificacion de ${getAccountDisplayName(account)}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Verificar",
          onPress: () =>
            runAccountAction(
              () => verifyAdminAccount(account.userId),
              "Cuenta verificada",
              "La cuenta fue verificada correctamente."
            ),
        },
      ]
    );
  };

  const confirmActivate = () => {
    if (!account) return;

    Alert.alert(
      "Activar cuenta",
      `Confirma la activacion de ${getAccountDisplayName(account)}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Activar",
          onPress: () =>
            runAccountAction(
              () => activateAdminAccount(account.userId),
              "Cuenta activada",
              "La cuenta fue activada correctamente."
            ),
        },
      ]
    );
  };

  const handleSuspend = async (reason?: string) => {
    if (!account) return;

    setSuspendModalVisible(false);
    await runAccountAction(
      () => suspendAdminAccount(account.userId, reason ? { reason } : undefined),
      "Cuenta suspendida",
      "La cuenta fue suspendida correctamente."
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: account ? getAccountDisplayName(account) : "Detalle de cuenta",
          headerShown: true,
        }}
      />

      <AdminScreenContainer>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#369BC9" />
            <Text style={styles.loadingText}>Cargando informacion...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAccountDetail}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : account ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={18} color="#369BC9" />
              <Text style={styles.backButtonText}>Volver a cuentas</Text>
            </TouchableOpacity>

            <AdminAccountDetail account={account} />
            <AdminAccountActions
              account={account}
              actionLoading={actionLoading}
              onVerify={confirmVerify}
              onActivate={confirmActivate}
              onOpenSuspend={() => setSuspendModalVisible(true)}
            />
          </ScrollView>
        ) : null}
      </AdminScreenContainer>

      <SuspendAccountModal
        visible={suspendModalVisible}
        loading={actionLoading}
        onClose={() => setSuspendModalVisible(false)}
        onSubmit={handleSuspend}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
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
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#369BC9",
  },
});
