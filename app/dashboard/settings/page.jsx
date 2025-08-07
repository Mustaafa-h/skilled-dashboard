// app/dashboard/settings/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './settings.module.css';

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
    <div className={styles.container}>
      <h1 className={styles.heading}>
        {t('settings', { defaultValue: 'Settings' })}
      </h1>
      <p className={styles.label}>
        {t('chooseLanguage', { defaultValue: 'Choose your language' })}:
      </p>
      <div className={styles.buttons}>
        <button
          onClick={() => handleLanguageChange('en')}
          disabled={currentLocale === 'en'}
          className={styles.button}
        >
          English
        </button>
        <button
          onClick={() => handleLanguageChange('ar')}
          disabled={currentLocale === 'ar'}
          className={styles.button}
        >
          العربية
        </button>
      </div>
    </div>
  );
}
