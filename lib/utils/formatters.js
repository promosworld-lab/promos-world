export function formatMoney(value, language = 'fr') {
  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  return new Intl.NumberFormat(locale).format(Number(value || 0))
}

export function formatDate(value, language = 'fr') {
  if (!value) return ''

  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTime(value, language = 'fr') {
  if (!value) return ''

  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function truncateText(text = '', length = 100) {
  if (text.length <= length) return text

  return `${text.slice(0, length).trim()}...`
}