'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/app/ui/dashboard/preferences/preferences.module.css';
import {
  getCompanyPreferences,
  getPreferenceTypes,
  createCompanyPreference,
  updateCompanyPreference,
  getServiceById
} from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

export default function ServicePreferencesPage() {
  const { serviceId } = useParams();
  const t = useTranslations();

  const [preferences, setPreferences] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [companyPreferences, setCompanyPreferences] = useState([]);
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(true);

  const companyId = '6c886af4-701a-4133-b68f-1647ad3efcad';

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching service prefs for serviceId:', serviceId);
      setLoading(true);
      try {
        const { data: cpData } = await getCompanyPreferences(companyId);
        console.log('Company preferences:', cpData);
        setCompanyPreferences(cpData.data);

        const { data: serviceData } = await getServiceById(serviceId);
        setServiceName(serviceData.data.name);
        console.log('Service name:', serviceData.data.name);

        const { data: prefTypesData } = await getPreferenceTypes(serviceId);
        setPreferences(prefTypesData.data);
        console.log('Preference types:', prefTypesData.data);

        const initial = {};
        cpData.data.forEach(pref => {
          initial[pref.preference_type_id] = {
            id: pref.id,
            price: pref.per_unit_cost || '',
            isActive: pref.is_available,
          };
          if (pref.preference_option_id) {
            initial[pref.preference_option_id] = {
              id: pref.id,
              price: pref.per_unit_cost || '',
              isActive: pref.is_available,
            };
          }
        });
        console.log('Initial state:', initial);
        setStates(initial);
      } catch (err) {
        console.error('Failed to fetch service preferences:', err);
        toast.error(t('loadPreferencesError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  const handleSave = async (basePayload, idKey, prefType) => {
    console.log('Saving preference for', idKey, basePayload);
    try {
      let costType = 'fixed';
      if (prefType === 'number') costType = 'per_worker';
      else if (prefType === 'single-select') costType = 'fixed';

      const payload = {
        ...basePayload,
        cost_type: costType,
      };
      if (prefType === 'number') delete payload.preference_option_id;

      if (states[idKey]?.id) {
        await updateCompanyPreference(states[idKey].id, payload);
        toast.success(t('preferenceUpdated'));
      } else {
        const { data } = await createCompanyPreference(payload);
        setStates(prev => ({
          ...prev,
          [idKey]: { ...prev[idKey], id: data.data.id },
        }));
        toast.success(t('preferenceCreated'));
      }
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(t('saveFailed'));
    }
  };

  if (loading) return <p className={styles.loading}>{t('loadingPreferences')}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{serviceName} - {t('servicePreferences')}</h2>
      {preferences.length === 0 ? (
        <p className={styles.noOptions}>{t('noPreferences')}</p>
      ) : preferences.map(pref => (
        <div key={pref.id} className={styles.prefBlock}>
          <strong>{pref.name}</strong>
          <p className={styles.prefDescription}>{pref.description}</p>

          {pref.type === 'single-select' && pref.options.map(option => (
            <div key={option.id} className={styles.optionRow}>
              <label>
                <input
                  type="checkbox"
                  checked={states[option.id]?.isActive || false}
                  onChange={e => setStates(prev => ({
                    ...prev,
                    [option.id]: {
                      ...prev[option.id],
                      isActive: e.target.checked,
                    },
                  }))}
                /> {option.display_name} - {option.description}
              </label>
              <input
                type="number"
                placeholder={t('price')}
                value={states[option.id]?.price || ''}
                onChange={e => setStates(prev => ({
                  ...prev,
                  [option.id]: {
                    ...prev[option.id],
                    price: e.target.value,
                  },
                }))}
                className={styles.priceInput}
              />
              <button
                onClick={() => handleSave({
                  company_id: companyId,
                  preference_type_id: pref.id,
                  preference_option_id: option.id,
                  is_available: states[option.id]?.isActive || false,
                  per_unit_cost: parseFloat(states[option.id]?.price) || 0,
                }, option.id, pref.type)}
                className={styles.saveButton}
              >{t('save')}</button>
            </div>
          ))}

          {pref.type === 'boolean' && (
            <div className={styles.optionRow}>
              <label>
                <input
                  type="checkbox"
                  checked={states[pref.id]?.isActive || false}
                  onChange={e => setStates(prev => ({
                    ...prev,
                    [pref.id]: {
                      ...prev[pref.id],
                      isActive: e.target.checked,
                    },
                  }))}
                /> {t('enable')} {pref.name}
              </label>
              {states[pref.id]?.isActive && (
                <input
                  type="number"
                  placeholder={t('costIfEnabled')}
                  value={states[pref.id]?.price || ''}
                  onChange={e => setStates(prev => ({
                    ...prev,
                    [pref.id]: {
                      ...prev[pref.id],
                      price: e.target.value,
                    },
                  }))}
                  className={styles.priceInput}
                />
              )}
              <button
                onClick={() => handleSave({
                  company_id: companyId,
                  preference_type_id: pref.id,
                  is_available: states[pref.id]?.isActive || false,
                  per_unit_cost: parseFloat(states[pref.id]?.price) || 0,
                }, pref.id, pref.type)}
                className={styles.saveButton}
              >{t('save')}</button>
            </div>
          )}

          {pref.type === 'number' && (
            <div className={styles.optionRow}>
              <label>{t('baseCostPerUnitLabel')}</label>
              <input
                type="number"
                placeholder={t('baseCostPerUnitPlaceholder')}
                value={states[pref.id]?.price || ''}
                onChange={e => setStates(prev => ({
                  ...prev,
                  [pref.id]: {
                    ...prev[pref.id],
                    price: e.target.value,
                  },
                }))}
                className={styles.priceInput}
              />
              <button
                onClick={() => handleSave({
                  company_id: companyId,
                  preference_type_id: pref.id,
                  is_available: true,
                  per_unit_cost: parseFloat(states[pref.id]?.price) || 0,
                }, pref.id, pref.type)}
                className={styles.saveButton}
              >{t('save')}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
