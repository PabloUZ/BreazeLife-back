import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppErrorState from "@/src/components/common/AppErrorState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppButton from "@/src/components/common/AppButton";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import {
  generateCertificate,
  generatePayslip,
  getDocuments,
  getDownloadUrl,
  type AffiliateDocument,
  type DocumentType,
} from "@/src/services/api/documentService";
import { secureStoreService } from "@/src/services/storage/SecureStoreService";
import { colors, spacing, typography } from "@/src/theme";

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  AFFILIATION_CERTIFICATE: "Certificado de afiliacion",
  BALANCE_CERTIFICATE: "Certificado de saldo",
  ACCOUNT_STATEMENT: "Extracto de cuenta",
  PAYSLIP: "Colilla de pago",
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AffiliateDocumentsScreen() {
  const [documents, setDocuments] = useState<AffiliateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [generating, setGenerating] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const docs = await getDocuments();
      const sorted = docs.sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      setDocuments(sorted);
    } catch {
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDocuments();
  }, [loadDocuments]);

  const handleGenerate = async (type: DocumentType) => {
    setGenerating(type);
    try {
      if (type === "PAYSLIP") {
        await generatePayslip();
      } else {
        await generateCertificate({ type });
      }
      await loadDocuments();
      Alert.alert("Listo", `${DOCUMENT_LABELS[type]} generado correctamente.`);
    } catch {
      Alert.alert("Error", "No se pudo generar el documento.");
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (doc: AffiliateDocument) => {
    setDownloading(doc.documentId);
    try {
      const token = await secureStoreService.getItem("access_token");

      if (!token) {
        Alert.alert("Error", "Sesion expirada. Inicia sesion nuevamente.");
        return;
      }

      const url = getDownloadUrl(doc.documentId);
      const localPath = `${FileSystem.cacheDirectory ?? ""}${doc.fileName}`;

      const result = await FileSystem.downloadAsync(url, localPath, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (result.status === 200) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(result.uri, {
            mimeType: "application/pdf",
            dialogTitle: doc.fileName,
          });
        } else {
          Alert.alert("Descargado", `Archivo guardado en: ${result.uri}`);
        }
      } else {
        Alert.alert("Error", "No se pudo descargar el documento.");
      }
    } catch {
      Alert.alert("Error", "Hubo un problema al descargar el PDF.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AffiliateScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AppHeader
          title="Mis documentos"
          subtitle="Genera y descarga certificados, extractos y colillas desde tu cuenta."
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Solicitar documento</Text>
          <Text style={styles.sectionSubtitle}>
            Genera un nuevo archivo y agregalo al historial.
          </Text>

          <View style={styles.generateList}>
            {(
              [
                "AFFILIATION_CERTIFICATE",
                "BALANCE_CERTIFICATE",
                "ACCOUNT_STATEMENT",
                "PAYSLIP",
              ] as DocumentType[]
            ).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.generateRow,
                  generating === type && styles.generateRowDisabled,
                ]}
                onPress={() => handleGenerate(type)}
                disabled={generating !== null}
                activeOpacity={0.82}
              >
                <View style={styles.generateCopy}>
                  <Text style={styles.generateLabel}>{DOCUMENT_LABELS[type]}</Text>
                  <Text style={styles.generateHelp}>Generar nuevo documento</Text>
                </View>

                {generating === type ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name="arrow-forward-outline"
                    size={18}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </AppCard>

        {loading ? (
          <AppLoadingState message="Cargando documentos..." />
        ) : error ? (
          <AppErrorState message={error} onRetry={loadDocuments} />
        ) : documents.length === 0 ? (
          <AppEmptyState
            title="Sin documentos"
            description="Todavia no has generado documentos en tu historial."
          />
        ) : (
          <View style={styles.documentsList}>
            {documents.map((doc) => (
              <AppCard key={doc.documentId} style={styles.documentCard}>
                <View style={styles.documentCopy}>
                  <Text style={styles.documentType}>
                    {DOCUMENT_LABELS[doc.type] ?? doc.type}
                  </Text>
                  <Text style={styles.documentDate}>
                    Generado: {formatDate(doc.generatedAt)}
                  </Text>
                  <Text
                    style={styles.documentFileName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {doc.fileName}
                  </Text>
                </View>

                <AppButton
                  title="Descargar"
                  variant="secondary"
                  iconName="download-outline"
                  loading={downloading === doc.documentId}
                  disabled={downloading !== null && downloading !== doc.documentId}
                  onPress={() => handleDownload(doc)}
                  style={styles.downloadButton}
                />
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>
    </AffiliateScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  generateList: {
    gap: spacing.sm,
  },
  generateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generateRowDisabled: {
    opacity: 0.75,
  },
  generateCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  generateLabel: {
    ...typography.bodyStrong,
    color: colors.neutralText,
  },
  generateHelp: {
    ...typography.caption,
    color: colors.textMuted,
  },
  documentsList: {
    gap: spacing.md,
  },
  documentCard: {
    gap: spacing.md,
  },
  documentCopy: {
    gap: spacing.xs,
  },
  documentType: {
    ...typography.cardTitle,
    color: colors.text,
  },
  documentDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  documentFileName: {
    ...typography.body,
    color: colors.neutralText,
  },
  downloadButton: {
    width: "100%",
  },
});
