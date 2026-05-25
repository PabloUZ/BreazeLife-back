import type { AdminQuoteDto, QuoteStatus } from "@/src/dtos/admin/admin.dtos";

export function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "ACCEPTED":
      return "Aprobada";
    case "REJECTED":
      return "Rechazada";
    default:
      return status;
  }
}

export function getQuoteStatusColors(status: QuoteStatus) {
  switch (status) {
    case "PENDING":
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    case "ACCEPTED":
      return { backgroundColor: "#D1FAE5", color: "#166534" };
    case "REJECTED":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
  }
}

export function sortQuotesForReview(quotes: AdminQuoteDto[]): AdminQuoteDto[] {
  const order: Record<QuoteStatus, number> = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2,
  };

  return [...quotes].sort((left, right) => {
    const statusDifference = order[left.status] - order[right.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return (
      new Date(right.contributionDate).getTime() -
      new Date(left.contributionDate).getTime()
    );
  });
}
