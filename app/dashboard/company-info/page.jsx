"use client";

import styles from "./companyInfo.module.css";
import { MdLocationOn, MdBusiness, MdEmail, MdPhone, MdPushPin } from "react-icons/md";
import { useTranslations } from "next-intl";

const CompanyInfoPage = () => {
  const t = useTranslations();

  const company = {
    name: "Skilled Worker",
    tradeNumber: "SW-2025-001",
    location: "Baghdad, Iraq",
    contact: "+964 770 000 0000",
    email: "info@skilledworker.com",
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>{t("companyInfoTitle", { defaultValue: "Company Information" })}</h2>
        <div className={styles.infoCard}>
          <p><MdPushPin /> <strong>{t("name", { defaultValue: "Name" })}:</strong> {company.name}</p>
          <p><MdBusiness /> <strong>{t("tradeNumber", { defaultValue: "Trade Number" })}:</strong> {company.tradeNumber}</p>
          <p><MdLocationOn /> <strong>{t("location", { defaultValue: "Location" })}:</strong> {company.location}</p>
          <p><MdPhone /> <strong>{t("contact", { defaultValue: "Contact" })}:</strong> {company.contact}</p>
          <p><MdEmail /> <strong>{t("email", { defaultValue: "Email" })}:</strong> {company.email}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoPage;
