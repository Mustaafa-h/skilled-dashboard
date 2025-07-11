'use client';
import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations();

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
        {t('privacyPolicy', { defaultValue: 'Privacy Policy' })}
      </h1>
      <p>
        {t('privacyPolicyDescription', {
          defaultValue: 'This is the privacy policy of your company. Update this page with your actual privacy terms, data usage, and customer data handling information as required.'
        })}
      </p>
    </div>
  );
}
