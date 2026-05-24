import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminQuoteDetail from "@/src/components/admin/quotes/AdminQuoteDetail";
import QuoteReviewActionModal from "@/src/components/admin/quotes/QuoteReviewActionModal";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import type { AdminQuoteDto } from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import {
  approveAdminQuote,
  getAdminQuoteById,
  rejectAdminQuote,
} from "@/src/services/api/adminQuoteService";

type ReviewAction = "approve" | "reject" | null;

function mapErrorToMessage(error: ApiErrorResponseDto): string {
  if (error.status_code === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }
  if (error.status_code === 403) {
    return "No tienes permisos para revisar esta cotizacion.";
  }
  if (error.status_code === 404) {
    return "Cotizacion no encontrada.";
  }

  return error.message || "No se pudo cargar la cotizacion. Intenta de nuevo.";
}

export default function AdminQuoteDetailScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { quoteId } = useLocalSearchParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<AdminQuoteDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ReviewAction>(null);

  const canReview = quote?.status === "PENDING";

  const modalConfig = useMemo(() => {
    if (activeAction === "approve") {
      return {
        actionLabel: "Aprobar",
        description:
          "Confirma la aprobacion de esta cotizacion. Puedes registrar un comentario opcional de revision.",
        title: "Aprobar cotizacion",
      };
    }

    if (activeAction === "reject") {
      return {
        actionLabel: "Rechazar",
        description:
          "Confirma el rechazo de esta cotizacion. Puedes registrar un comentario opcional de revision.",
        title: "Rechazar cotizacion",
      };
    }

    return null;
  }, [activeAction]);

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesion expirada",
      "Tu sesion expiro. Inicia sesion nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const handleGoBack = useCallback(() => {
    router.replace("/(tabs)/(admin)/quotes");
  }, [router]);

  const fetchQuoteDetail = useCallback(async () => {
    if (!quoteId) {
      setError("Cotizacion no encontrada.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAdminQuoteById(quoteId);
      setQuote(data);
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
  }, [handleUnauthorized, quoteId]);

  useFocusEffect(
    useCallback(() => {
      fetchQuoteDetail();
    }, [fetchQuoteDetail])
  );

  const runReviewAction = useCallback(
    async (action: ReviewAction, comment?: string) => {
      if (!quote || !action) return;

      try {
        setActionLoading(true);

        if (action === "approve") {
          await approveAdminQuote(quote.quoteId, comment ? { comment } : undefined);
        } else {
          await rejectAdminQuote(quote.quoteId, comment ? { comment } : undefined);
        }

        await fetchQuoteDetail();
        setActiveAction(null);

        Alert.alert(
          action === "approve" ? "Cotizacion aprobada" : "Cotizacion rechazada",
          action === "approve"
            ? "La cotizacion fue aprobada correctamente."
            : "La cotizacion fue rechazada correctamente."
        );
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
    [fetchQuoteDetail, handleUnauthorized, quote]
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: quote ? quote.quoteId : "Detalle de cotizacion",
          headerShown: true,
        }}
      />

      <ScreenContainer>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#369BC9" />
            <Text style={styles.loadingText}>Cargando cotizacion...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchQuoteDetail}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : quote ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={18} color="#369BC9" />
              <Text style={styles.backButtonText}>Volver a cotizaciones</Text>
            </TouchableOpacity>

            <AdminQuoteDetail quote={quote} />

            {canReview ? (
              <View style={styles.actionsCard}>
                <Text style={styles.actionsTitle}>Revision administrativa</Text>
                <Text style={styles.actionsSubtitle}>
                  Aprueba o rechaza esta cotizacion y agrega un comentario si lo
                  necesitas para dejar trazabilidad.
                </Text>
                <View style={styles.actionsList}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.approveButton,
                      actionLoading && styles.actionDisabled,
                    ]}
                    disabled={actionLoading}
                    onPress={() => setActiveAction("approve")}
                  >
                    <Text style={styles.actionButtonText}>Aprobar cotizacion</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.rejectButton,
                      actionLoading && styles.actionDisabled,
                    ]}
                    disabled={actionLoading}
                    onPress={() => setActiveAction("reject")}
                  >
                    <Text style={styles.actionButtonText}>Rechazar cotizacion</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </ScreenContainer>

      <QuoteReviewActionModal
        visible={activeAction !== null}
        loading={actionLoading}
        onClose={() => setActiveAction(null)}
        onSubmit={(comment) => runReviewAction(activeAction, comment)}
        title={modalConfig?.title || ""}
        description={modalConfig?.description || ""}
        actionLabel={modalConfig?.actionLabel || ""}
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
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  actionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  actionsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
  actionsList: {
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  approveButton: {
    backgroundColor: "#16A34A",
  },
  rejectButton: {
    backgroundColor: "#DC2626",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  actionDisabled: {
    opacity: 0.6,
  },
});
