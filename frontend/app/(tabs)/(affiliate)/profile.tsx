import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import ProfileCard from "@/src/components/profile/ProfileCard";
import type {
  AffiliateProfileDto,
  UpdateAffiliateProfileDto,
} from "@/src/dtos/affiliate/affiliate.dtos";
import {
  getAffiliateProfile,
  updateAffiliateProfile,
} from "@/src/services/api/affiliateService";
import { spacing } from "@/src/theme";
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
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await getAffiliateProfile();
      setProfile(data);
      setForm({
        email: data.email,
        phone: data.phone,
        account_type: data.account?.accountType ?? "MODERATE",
        current_password: "",
        new_password: "",
      });
    } catch {
      setError("No se pudo cargar el perfil. Verifica tu conexion.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleCancel() {
    if (!profile) {
      return;
    }

    setForm({
      email: profile.email,
      phone: profile.phone,
      account_type: profile.account?.accountType ?? "MODERATE",
      current_password: "",
      new_password: "",
    });
    setEditing(false);
  }

  async function handleSave() {
    if (!profile) {
      return;
    }

    const body: UpdateAffiliateProfileDto = {};

    if (form.email !== profile.email) {
      body.email = form.email;
    }

    if (form.phone !== profile.phone) {
      body.phone = form.phone;
    }

    if (form.account_type !== profile.account?.accountType) {
      body.account_type = form.account_type;
    }

    if (form.new_password) {
      if (!form.current_password) {
        Alert.alert("Error", "Ingresa tu contrasena actual para poder cambiarla.");
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
      Alert.alert("Exito", "Perfil actualizado correctamente.");
      setEditing(false);
      await load();
    } catch {
      Alert.alert("Error", "No se pudo actualizar el perfil. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AffiliateScreenContainer>
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
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Datos de afiliacion</Text>
              <InfoRow label="Documento" value={profile.document} />
              <Divider />
              <InfoRow label="Estado" value={STATUS_LABELS[profile.status] ?? profile.status} />
              <Divider />
              <InfoRow
                label="Fecha de nacimiento"
                value={formatLocalDate(profile.birthDate)}
              />
              <Divider />
              <InfoRow
                label="Fecha de afiliacion"
                value={formatLocalDate(profile.affiliationDate)}
              />
              <Divider />
              <InfoRow label="Telefono" value={profile.phone} />
            </View>

            {profile.account ? (
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
                  label="Dias cotizados"
                  value={`${profile.account.quotedDays} dias`}
                />
              </View>
            ) : null}

            {!editing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditing(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Datos editables</Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Correo electronico</Text>
                    <TextInput
                      style={styles.input}
                      value={form.email}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, email: value }))
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="correo@ejemplo.com"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Telefono</Text>
                    <TextInput
                      style={styles.input}
                      value={form.phone}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, phone: value }))
                      }
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
                            setForm((current) => ({ ...current, account_type: type.value }))
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
                  <Text style={styles.sectionTitle}>Cambiar contrasena</Text>
                  <Text style={styles.sectionHint}>
                    Deja en blanco si no deseas cambiarla.
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Contrasena actual</Text>
                    <TextInput
                      style={styles.input}
                      value={form.current_password}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, current_password: value }))
                      }
                      secureTextEntry
                      placeholder="********"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Nueva contrasena</Text>
                    <TextInput
                      style={styles.input}
                      value={form.new_password}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, new_password: value }))
                      }
                      secureTextEntry
                      placeholder="Minimo 8 caracteres"
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
            )}
          </>
        ) : null}
      </ScrollView>
    </AffiliateScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
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
