import { Alert } from "react-native";
import { useCallback, useState } from "react";
import {
  downloadAffiliatesReport,
  downloadQuotesReport,
  type ReportParams,
} from "@/src/services/api/adminReportService";

export type ReportDownloadStatus = "idle" | "downloading" | "done" | "error";

export type AdminReportsState = {
  quotesStatus: ReportDownloadStatus;
  affiliatesStatus: ReportDownloadStatus;
  downloadQuotes: (params: ReportParams) => Promise<void>;
  downloadAffiliates: (params?: Partial<ReportParams>) => Promise<void>;
};

export function useAdminReports(): AdminReportsState {
  const [quotesStatus, setQuotesStatus] = useState<ReportDownloadStatus>("idle");
  const [affiliatesStatus, setAffiliatesStatus] = useState<ReportDownloadStatus>("idle");

  const downloadQuotes = useCallback(async (params: ReportParams) => {
    try {
      setQuotesStatus("downloading");
      await downloadQuotesReport(params);
      setQuotesStatus("done");
      setTimeout(() => setQuotesStatus("idle"), 2000);
    } catch (error) {
      setQuotesStatus("error");
      setTimeout(() => setQuotesStatus("idle"), 2000);
      const msg = String(error);
      if (msg.includes("PDF_DOWNLOAD_FAILED")) {
        Alert.alert("Error", "No se pudo generar el reporte. Verifica que el rango de fechas sea válido.");
      } else if (msg.includes("SHARING_NOT_AVAILABLE")) {
        Alert.alert("Error", "La opción de compartir no está disponible en este dispositivo.");
      } else {
        Alert.alert("Error", "Ocurrió un error al descargar el reporte. Intenta de nuevo.");
      }
    }
  }, []);

  const downloadAffiliates = useCallback(async (params?: Partial<ReportParams>) => {
    try {
      setAffiliatesStatus("downloading");
      await downloadAffiliatesReport(params);
      setAffiliatesStatus("done");
      setTimeout(() => setAffiliatesStatus("idle"), 2000);
    } catch (error) {
      setAffiliatesStatus("error");
      setTimeout(() => setAffiliatesStatus("idle"), 2000);
      Alert.alert("Error", "Ocurrió un error al descargar el reporte. Intenta de nuevo.");
    }
  }, []);

  return {
    quotesStatus,
    affiliatesStatus,
    downloadQuotes,
    downloadAffiliates,
  };
}

