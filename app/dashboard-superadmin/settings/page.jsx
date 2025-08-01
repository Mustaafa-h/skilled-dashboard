'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations();
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    setCurrentLocale(document.cookie.includes('locale=ar') ? 'ar' : 'en');
  }, []);

  const handleLanguageChange = (locale) => {
    document.cookie = `locale=${locale}; path=/`;
    location.reload();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
        {t('settings', { defaultValue: 'Settings' })}
      </h1>
      <p style={{ marginBottom: '0.5rem' }}>
        {t('chooseLanguage', { defaultValue: 'Choose your language' })}:
      </p>
      <button
        onClick={() => handleLanguageChange('en')}
        disabled={currentLocale === 'en'}
        style={{ marginRight: '10px', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        disabled={currentLocale === 'ar'}
        style={{ padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
      >
        العربية
      </button>
    </div>
  );
}
