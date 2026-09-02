export function formatPrice(
  amount: number | string | null | undefined,
  currency = "FCFA"
) {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value) + ` ${currency}`;
}

export function formatDate(
  date: string | Date | null | undefined,
  locale = "fr-FR"
) {
  if (!date) return "-";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(
  date: string | Date | null | undefined,
  locale = "fr-FR"
) {
  if (!date) return "-";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function calculateDiscount(
  originalPrice: number,
  promoPrice: number
) {
  if (!originalPrice || originalPrice <= 0) return 0;

  return Math.round(
    ((originalPrice - promoPrice) / originalPrice) * 100
  );
}

export function calculateDeposit(total: number, rate = 0.3) {
  return Math.round(total * rate);
}

export function calculateRemaining(total: number, deposit: number) {
  return Math.max(0, total - deposit);
}

export function truncateText(
  text: string | null | undefined,
  maxLength = 100
) {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
}