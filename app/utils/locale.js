export function getLocale() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('locale') || 'en';
  }
  return 'en';
}

export function setLocale(locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale);
    window.location.reload();
  }
}