import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import ProfileCard from "@/src/components/profile/ProfileCard";
import { getAffiliateProfile } from "@/src/services/api/affiliateService";
import type { AffiliateProfileDto } from "@/src/dtos/affiliate/affiliate.dtos";
import { formatCurrency } from "@/src/utils/formatters";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CONSERVATIVE: "Conservador",
  MODERATE: "Moderado",
  RISKY: "Arriesgado",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspendido",
  INACTIVE: "Inactivo",
};

function formatLocalDate(isoDate: string): string {
  try {
    const [year, month, day] = isoDate.split("-");
    return new Date(`${year}-${month}-${day}T12:00:00`).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function AffiliateProfileScreen() {
  const [profile, setProfile] = useState<AffiliateProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getAffiliateProfile();
      setProfile(data);
    } catch {
      setError("No se pudo cargar el perfil. Verifica tu conexión.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor="#369BC9"
        />
      }
    >
      {/* Tarjeta básica del usuario (nombre, rol, logout) */}
      <ProfileCard />

      {/* Datos de afiliado desde el backend */}
      {loading && !profile ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#369BC9" />
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : profile ? (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Datos de afiliación</Text>
            <InfoRow label="Documento" value={profile.document} />
            <Divider />
            <InfoRow
              label="Estado"
              value={STATUS_LABELS[profile.status] ?? profile.status}
            />
            <Divider />
            <InfoRow
              label="Fecha de nacimiento"
              value={formatLocalDate(profile.birthDate)}
            />
            <Divider />
            <InfoRow
              label="Fecha de afiliación"
              value={formatLocalDate(profile.affiliationDate)}
            />
            <Divider />
            <InfoRow label="Teléfono" value={profile.phone} />
          </View>

          {profile.account && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cuenta pensional</Text>
              <InfoRow label="ID de cuenta" value={profile.account.accountId} />
              <Divider />
              <InfoRow
                label="Tipo de fondo"
                value={
                  ACCOUNT_TYPE_LABELS[profile.account.accountType] ??
                  profile.account.accountType
                }
              />
              <Divider />
              <InfoRow
                label="Saldo acumulado"
                value={formatCurrency(profile.account.balance)}
              />
              <Divider />
              <InfoRow
                label="Días cotizados"
                value={`${profile.account.quotedDays} días`}
              />
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 32 },
  loadingBox: { padding: 24, alignItems: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  infoRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: { fontSize: 14, color: "#6B7280", flexShrink: 0 },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flexShrink: 1,
    textAlign: "right",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    padding: 20,
    fontSize: 14,
  },
});
