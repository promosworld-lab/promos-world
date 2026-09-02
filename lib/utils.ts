export function formatPrice(
  amount: number,
  currency = "FCFA"
) {
  return new Intl.NumberFormat("fr-FR").format(amount) + ` ${currency}`;
}

export function calculateDiscount(
  originalPrice: number,
  promoPrice: number
) {
  if (!originalPrice || originalPrice <= 0) {
    return 0;
  }

  return Math.round(
    ((originalPrice - promoPrice) / originalPrice) * 100
  );
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}