export function toKobo(value: string) {
  return Math.round(Number(value) * 100);
}

export function koboToInput(kobo: number) {
  return (kobo / 100).toFixed(2);
}

export function formatCurrency(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}
