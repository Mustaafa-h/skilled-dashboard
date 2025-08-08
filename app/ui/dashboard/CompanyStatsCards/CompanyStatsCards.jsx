"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/CompanyStatsCards/CompanyStatsCards.module.css";
import { MdPeople, MdBuild, MdLayers, MdInventory2 } from "react-icons/md";
import { getCompany } from "@/app/lib/api";
import { useTranslations } from "next-intl";

const iconMap = {
  workers: <MdPeople size={24} />,
  services: <MdBuild size={24} />,
  subservices: <MdLayers size={24} />,
};

const Card = ({ icon, label, value }) => (
  <div className={styles.card}>
    <div className={styles.icon}>{icon}</div>
    <div className={styles.texts}>
      <span className={styles.title}>{label}</span>
      <span className={styles.number}>{value}</span>
    </div>
  </div>
);

export default function CompanyStatsCards({ companyId }) {
  const t = useTranslations();
  const [workersCount, setWorkersCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [subservicesCount, setSubservicesCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getCompany(companyId);
        const data = res.data;

        setWorkersCount(data.data.workers?.length || 0);
        setServicesCount(data.data.companyServices?.length || 0);
        setSubservicesCount(data.data.companySubservices?.length || 0);
      } catch (err) {
        console.error("Failed to fetch company stats:", err);
      }
    };

    if (companyId) fetchStats();
  }, [companyId]);

  return (
    <div className={styles.cards}>
      <Card icon={iconMap.workers} label={t("workers", { defaultValue: "Company Workers" })} value={workersCount} />
      <Card icon={iconMap.services} label={t("services", { defaultValue: "Services" })} value={servicesCount} />
      <Card icon={iconMap.subservices} label={t("subServices", { defaultValue: "Subservices" })} value={subservicesCount} />
    </div>
  );
}
