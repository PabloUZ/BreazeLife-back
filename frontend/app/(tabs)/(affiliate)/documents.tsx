import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { secureStoreService } from "@/src/services/storage/SecureStoreService";
import {
  getDocuments,
  generateCertificate,
  generatePayslip,
  getDownloadUrl,
  type AffiliateDocument,
  type DocumentType,
} from "@/src/services/api/documentService";

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  AFFILIATION_CERTIFICATE: "Certificado de Afiliación",
  BALANCE_CERTIFICATE: "Certificado de Saldo",
  ACCOUNT_STATEMENT: "Extracto de Cuenta",
  PAYSLIP: "Colilla de Pago",
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function AffiliateDocumentsScreen() {
  const [documents, setDocuments] = useState<AffiliateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [generating, setGenerating] = useState<DocumentType | null>(null);

  // ── Cargar documentos ───────────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      // getDocuments ya retorna todos incluyendo payslips
      // no necesitamos llamar getPayslips por separado
      const sorted = docs.sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      setDocuments(sorted);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los documentos.");
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

  // ── Generar certificado ─────────────────────────────────────────────────────

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

  // ── Descargar PDF ───────────────────────────────────────────────────────────

  const handleDownload = async (doc: AffiliateDocument) => {
    setDownloading(doc.documentId);
    try {
      const token = await secureStoreService.getItem("access_token");

      if (!token) {
        Alert.alert("Error", "Sesión expirada. Inicia sesión nuevamente.");
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

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando documentos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Documentos</Text>
        <Text style={styles.headerSubtitle}>
          Genera y descarga tus certificados y colillas
        </Text>
      </View>

      {/* Botones de generación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generar Documento</Text>
        <View style={styles.generateButtons}>
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
                styles.generateButton,
                generating === type && styles.generateButtonDisabled,
              ]}
              onPress={() => handleGenerate(type)}
              disabled={generating !== null}
            >
              {generating === type ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.generateButtonText}>
                  {DOCUMENT_LABELS[type]}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de documentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Documentos</Text>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No tienes documentos generados aún.
            </Text>
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.documentId} style={styles.documentCard}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentType}>
                  {DOCUMENT_LABELS[doc.type] ?? doc.type}
                </Text>
                <Text style={styles.documentDate}>
                  {formatDate(doc.generatedAt)}
                </Text>
                <Text style={styles.documentFileName}>{doc.fileName}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  downloading === doc.documentId && styles.downloadButtonDisabled,
                ]}
                onPress={() => handleDownload(doc)}
                disabled={downloading !== null}
              >
                {downloading === doc.documentId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.downloadButtonText}>⬇ Descargar</Text>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
  },
  header: {
    backgroundColor: "#0F2850",
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#B4C8E6",
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F2850",
    marginBottom: 12,
  },
  generateButtons: {
    gap: 10,
  },
  generateButton: {
    backgroundColor: "#0066CC",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  generateButtonDisabled: {
    backgroundColor: "#99BBDD",
  },
  generateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
  documentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F2850",
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  documentFileName: {
    fontSize: 11,
    color: "#999",
  },
  downloadButton: {
    backgroundColor: "#0066CC",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  downloadButtonDisabled: {
    backgroundColor: "#99BBDD",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
