export function formatCurrency(amount: number): string {
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-");
  const monthLabels = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const monthIndex = Number(monthNumber) - 1;
  const shortMonth = monthLabels[monthIndex] ?? month;

  return `${shortMonth} ${year}`;
}

export function getPercent(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}
