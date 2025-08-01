"use client";

import styles from "@/app/dashboard/privacy/privacy.module.css";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("privacyPolicy.title")}</h1>
      <p className={styles.paragraph}>
        {t("privacyPolicy.intro")}
      </p>

      <h2 className={styles.subtitle}>{t("privacyPolicy.section1Title")}</h2>
      <p className={styles.paragraph}>
        {t("privacyPolicy.section1Text")}
      </p>

      <h2 className={styles.subtitle}>{t("privacyPolicy.section2Title")}</h2>
      <p className={styles.paragraph}>
        {t("privacyPolicy.section2Text")}
      </p>

      <h2 className={styles.subtitle}>{t("privacyPolicy.section3Title")}</h2>
      <p className={styles.paragraph}>
        {t("privacyPolicy.section3Text")}
      </p>

      <h2 className={styles.subtitle}>{t("privacyPolicy.section4Title")}</h2>
      <p className={styles.paragraph}>
        {t("privacyPolicy.section4Text")}
      </p>
    </div>
  );
}
