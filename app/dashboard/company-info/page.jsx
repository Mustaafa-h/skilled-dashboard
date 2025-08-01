"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getCompany } from "@/app/lib/api";
import styles from "./companyInfo.module.css";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const MapPicker = dynamic(() => import("@/app/ui/map/MapPicker"), {
  ssr: false,
});

const CompanyInfoPage = () => {
  const t = useTranslations();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);


  const companyId = (typeof window !== "undefined" ? localStorage.getItem("companyId") : null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!companyId) {
          console.warn("🚫 No companyId found.");
          toast.error(t("errorsmissingCompanyId"));
          return;
        }

        const res = await getCompany(companyId);
        console.log("✅ Company fetched:", res.data.data);
        setCompany(res.data.data);
      } catch (err) {
        console.error("❌ Error fetching company:", err);
        toast.error(t("errorsfetchCompany"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (loading) return <div className={styles.container}>{t("loading")}</div>;
  if (!company) return <div className={styles.container}>{t("companyInfonotFound")}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.top}>
          <h2 className={styles.title}>
            {t("companyInfotitle")}
          </h2>
          <Link href="/dashboard/company-info/edit" className={styles.editButton}>
            {t("actionsedit")}
          </Link>
        </div>

        <div className={styles.infoCard}>
          
          <p><strong>{t("companyInfologo")}:</strong></p>
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt="Company Logo"
              style={{ width: "100px", height: "auto", borderRadius: "8px" }}
            />
          ) : (
            <p>No logo available</p>
          )}
          <p><strong>{t("companyInfoname")}:</strong> {company.name || "—"}</p>
          <p><strong>{t("companyInfoabout")}:</strong> {company.about || "—"}</p>
          <p><strong>{t("companyInfostatus")}:</strong> {company.status || "—"}</p>
          <p><strong>{t("companyInfowebsite")}:</strong> {company.website_url || "—"}</p>
          <p><strong>{t("companyInfopriceRange")}:</strong> {company.price_range || "—"}</p>
          <p><strong>{t("companyInfoverified")}:</strong> {company.is_verified ? t("yes") : t("no")}</p>
        </div>

        <div className={styles.mapContainer}>
          <MapPicker
            lat={company.lat}
            lng={company.long}
            onLocationSelect={() => { }} // no-op for view-only
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoPage;
