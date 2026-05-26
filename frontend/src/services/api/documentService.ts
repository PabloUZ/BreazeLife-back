import { httpClient } from "@/src/config/http";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type DocumentType =
    | "AFFILIATION_CERTIFICATE"
    | "BALANCE_CERTIFICATE"
    | "ACCOUNT_STATEMENT"
    | "PAYSLIP";

export type AffiliateDocument = {
    documentId: string;
    type: DocumentType;
    fileName: string;
    generatedAt: string;
    downloadUrl: string;
};

export type GenerateCertificateRequest = {
    type: DocumentType;
    fromDate?: string;
    toDate?: string;
};

/**
 * BLIFE-60 — Lista todos los documentos del afiliado autenticado.
 */
export const getDocuments = async (): Promise<AffiliateDocument[]> => {
    const response = await httpClient.get<{
        data: { items: AffiliateDocument[] };
    }>("/api/v1/affiliates/documents");
    return response.data.data.items;
};

/**
 * BLIFE-60 — Genera un certificado PDF (afiliación, saldo o extracto).
 */
export const generateCertificate = async (
    request: GenerateCertificateRequest
): Promise<AffiliateDocument> => {
    const response = await httpClient.post<{
        data: AffiliateDocument;
    }>("/api/v1/affiliates/documents/certificate", request);
    return response.data.data;
};

/**
 * BLIFE-15 — Lista las colillas históricas del afiliado.
 */
export const getPayslips = async (): Promise<AffiliateDocument[]> => {
    const response = await httpClient.get<{
        data: { items: AffiliateDocument[] };
    }>("/api/v1/affiliates/documents/payslips");
    return response.data.data.items;
};

/**
 * BLIFE-15 — Genera una colilla de pago PDF.
 */
export const generatePayslip = async (): Promise<AffiliateDocument> => {
    const response = await httpClient.post<{
        data: AffiliateDocument;
    }>("/api/v1/affiliates/documents/payslips", {});
    return response.data.data;
};

/**
 * BLIFE-60 — Retorna la URL completa de descarga de un documento.
 * El token se inyecta automáticamente por el interceptor de httpClient.
 */
export const getDownloadUrl = (documentId: string): string => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
    return `${baseUrl}/api/v1/affiliates/documents/${documentId}/download`;
};