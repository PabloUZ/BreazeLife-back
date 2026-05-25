import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import ProfileCard from "@/src/components/profile/ProfileCard";
import {
  getAffiliateProfile,
  updateAffiliateProfile,
} from "@/src/services/api/affiliateService";
import type {
  AffiliateProfileDto,
  UpdateAffiliateProfileDto,
} from "@/src/dtos/affiliate/affiliate.dtos";
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

const ACCOUNT_TYPES = [
  { value: "CONSERVATIVE", label: "Conservador" },
  { value: "MODERATE", label: "Moderado" },
  { value: "RISKY", label: "Arriesgado" },
] as const;

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

type EditForm = {
  email: string;
  phone: string;
  account_type: string;
  current_password: string;
  new_password: string;
};

export default function AffiliateProfileScreen() {
  const [profile, setProfile] = useState<AffiliateProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    email: "",
    phone: "",
    account_type: "MODERATE",
    current_password: "",
    new_password: "",
  });

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getAffiliateProfile();
      setProfile(data);
      setForm({
        email: data.email,
        phone: data.phone,
        account_type: data.account?.account_type ?? "MODERATE",
        current_password: "",
        new_password: "",
      });
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

  function handleCancel() {
    if (!profile) return;
    setForm({
      email: profile.email,
      phone: profile.phone,
      account_type: profile.account?.account_type ?? "MODERATE",
      current_password: "",
      new_password: "",
    });
    setEditing(false);
  }

  async function handleSave() {
    if (!profile) return;

    const body: UpdateAffiliateProfileDto = {};
    if (form.email !== profile.email) body.email = form.email;
    if (form.phone !== profile.phone) body.phone = form.phone;
    if (form.account_type !== profile.account?.account_type)
      body.account_type = form.account_type;
    if (form.new_password) {
      if (!form.current_password) {
        Alert.alert("Error", "Ingresa tu contraseña actual para poder cambiarla.");
        return;
      }
      body.current_password = form.current_password;
      body.new_password = form.new_password;
    }

    if (Object.keys(body).length === 0) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateAffiliateProfile(body);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      setEditing(false);
      await load();
    } catch {
      Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        !editing ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#369BC9"
          />
        ) : undefined
      }
    >
      {/* Tarjeta básica del usuario */}
      <ProfileCard />

      {loading && !profile ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#369BC9" />
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : profile ? (
        !editing ? (
          <>
            {/* Vista de datos */}
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
                value={formatLocalDate(profile.birth_date)}
              />
              <Divider />
              <InfoRow
                label="Fecha de afiliación"
                value={formatLocalDate(profile.affiliation_date)}
              />
              <Divider />
              <InfoRow label="Teléfono" value={profile.phone} />
            </View>

            {profile.account && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Cuenta pensional</Text>
                <InfoRow label="ID de cuenta" value={profile.account.account_id} />
                <Divider />
                <InfoRow
                  label="Tipo de fondo"
                  value={
                    ACCOUNT_TYPE_LABELS[profile.account.account_type] ??
                    profile.account.account_type
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
                  value={`${profile.account.quoted_days} días`}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Formulario de edición */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos editables</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                  placeholder="3001234567"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Tipo de fondo pensional</Text>
                <View style={styles.chipRow}>
                  {ACCOUNT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.chip,
                        form.account_type === type.value && styles.chipActive,
                      ]}
                      onPress={() =>
                        setForm((f) => ({ ...f, account_type: type.value }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.account_type === type.value && styles.chipTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
              <Text style={styles.sectionHint}>
                Deja en blanco si no deseas cambiarla.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Contraseña actual</Text>
                <TextInput
                  style={styles.input}
                  value={form.current_password}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, current_password: v }))
                  }
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nueva contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={form.new_password}
                  onChangeText={(v) =>
                    setForm((f) => ({ ...f, new_password: v }))
                  }
                  secureTextEntry
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingBottom: 40 },
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
  sectionHint: {
    fontSize: 12,
    color: "#9CA3AF",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
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
  fieldGroup: { paddingHorizontal: 20, paddingVertical: 10 },
  fieldLabel: { fontSize: 13, color: "#6B7280", fontWeight: "500", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: { backgroundColor: "#369BC9", borderColor: "#369BC9" },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  chipTextActive: { color: "#FFFFFF" },
  editButton: {
    backgroundColor: "#369BC9",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  editButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  actionRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 16 },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#369BC9",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  errorText: { color: "#DC2626", textAlign: "center", padding: 20, fontSize: 14 },
});
