// @ts-ignore – expo-file-system v19 exposes legacy API via /legacy subpath
import { cacheDirectory, downloadAsync } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { secureStoreService } from "@/src/services/storage/SecureStoreService";
import { TOKEN_KEYS } from "@/src/config/http";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
const BASE_PATH = `${BASE_URL}/api/v1/admin/reports`;

export type ReportType = "quotes" | "affiliates";

export interface ReportParams {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

async function downloadAndSharePdf(
  url: string,
  filename: string
): Promise<void> {
  const token = await secureStoreService.getItem(TOKEN_KEYS.ACCESS);

  const localUri = `${cacheDirectory ?? ""}${filename}`;

  const result = await downloadAsync(url, localUri, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (result.status !== 200) {
    throw new Error("PDF_DOWNLOAD_FAILED");
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("SHARING_NOT_AVAILABLE");
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Abrir reporte PDF",
    UTI: "com.adobe.pdf",
  });
}

export async function downloadQuotesReport(params: ReportParams): Promise<void> {
  const url = `${BASE_PATH}/quotes?from=${params.from}&to=${params.to}`;
  const filename = `reporte-cotizaciones-${params.from}-${params.to}.pdf`;
  await downloadAndSharePdf(url, filename);
}

export async function downloadAffiliatesReport(params?: Partial<ReportParams>): Promise<void> {
  let url = `${BASE_PATH}/affiliates`;
  if (params?.from && params?.to) {
    url += `?from=${params.from}&to=${params.to}`;
  }
  const suffix =
    params?.from && params?.to
      ? `${params.from}-${params.to}`
      : new Date().toISOString().slice(0, 10);
  const filename = `reporte-afiliados-${suffix}.pdf`;
  await downloadAndSharePdf(url, filename);
}







