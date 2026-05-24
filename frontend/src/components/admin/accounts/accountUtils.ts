import type {
  AdminAccountDetailDto,
  AdminAccountListItemDto,
  AdminAccountRole,
  AdminAccountStatus,
} from "@/src/dtos/admin/admin.dtos";

export function getAccountDisplayName(
  account: AdminAccountListItemDto | AdminAccountDetailDto
): string {
  if (account.role === "EMPLOYER") {
    if ("employer" in account) {
      return account.employer?.companyName || "Empresa";
    }

    return ("companyName" in account && account.companyName) || "Empresa";
  }

  return `${account.firstName} ${account.lastName}`.trim();
}

export function getRoleLabel(role: AdminAccountRole): string {
  return role === "AFFILIATE" ? "Afiliado" : "Empleador";
}

export function getStatusLabel(status: AdminAccountStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Activo";
    case "SUSPENDED":
      return "Suspendido";
    case "INACTIVE":
      return "Inactivo";
    default:
      return status;
  }
}

export function getVerificationLabel(verified: boolean): string {
  return verified ? "Verificada" : "Sin verificar";
}

export function getStatusColors(status: AdminAccountStatus) {
  switch (status) {
    case "ACTIVE":
      return { backgroundColor: "#D1FAE5", color: "#166534" };
    case "SUSPENDED":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
    case "INACTIVE":
      return { backgroundColor: "#E5E7EB", color: "#374151" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
  }
}

export function getVerificationColors(verified: boolean) {
  return verified
    ? { backgroundColor: "#DBEAFE", color: "#1D4ED8" }
    : { backgroundColor: "#FEF3C7", color: "#B45309" };
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return "N/A";
  }

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return dateString;
  }

  return `${day}/${month}/${year}`;
}

export function getAccountIdentifier(
  account: AdminAccountListItemDto | AdminAccountDetailDto
): string | null {
  if (account.role === "AFFILIATE") {
    if ("affiliate" in account) {
      return account.affiliate?.document || null;
    }

    return ("document" in account && account.document) || null;
  }

  if ("employer" in account) {
    return account.employer?.nit || null;
  }

  return ("nit" in account && account.nit) || null;
}
