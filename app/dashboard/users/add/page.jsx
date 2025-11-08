"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

// styles: keep your existing module path/name
import styles from "./page.module.css";

// api helpers added above
import {
  getWorkerTypes,
  getSkillsByWorkerType,
  addCompanyWorker,
} from "../../../lib/api";

const COUNTRIES = [
  "Iraq", "Jordan", "Saudi Arabia", "United Arab Emirates", "Qatar",
  "Kuwait", "Bahrain", "Oman", "Egypt", "Turkey",
  "India", "Pakistan", "United Kingdom", "United States", "Germany"
];

export default function AddWorkerPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();

  // expect companyId from route or query — keep both to be safe
  // const companyIdFromQuery = params?.get("companyId");
  // const [companyId, setCompanyId] = useState(companyIdFromQuery || "");

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  // form state
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("Iraq");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male"); // enum: 'male' | 'female'
  const [imageFile, setImageFile] = useState(null);

  // catalog
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // skill selections: { [skill_id]: { checked: boolean, years?: number, cert?: string } }
  const [chosen, setChosen] = useState({});

  const [submitting, setSubmitting] = useState(false);

  // bootstrap companyId if you pass it via path param elsewhere
  // useEffect(() => {
  //   if (!companyId && typeof window !== "undefined") {
  //     const url = new URL(window.location.href);
  //     const fallback = url.pathname.split("/").find((seg) =>
  //       /^[0-9a-fA-F-]{36}$/.test(seg)
  //     );
  //     if (fallback) setCompanyId(fallback);
  //   }
  // }, [companyId]);

  // load worker types
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        console.log("[UI] fetching worker types…");
        const res = await getWorkerTypes();
        console.log("[UI] worker types response:", res?.data);
        const rows = res?.data?.data || res?.data || [];
        if (mounted) setTypes(rows);
      } catch (e) {
        console.error("[UI] getWorkerTypes error:", e);
        toast.error(t("common.error"));
      } finally {
        setLoadingTypes(false);
      }
    })();
    return () => { mounted = false; };
  }, [t]);

  // when type changes → fetch skills
  useEffect(() => {
    if (!selectedTypeId) {
      setSkills([]);
      setChosen({});
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoadingSkills(true);
        console.log("[UI] fetching skills for type:", selectedTypeId);
        const res = await getSkillsByWorkerType(selectedTypeId);
        console.log("[UI] skills response:", res?.data);
        const rows = res?.data?.data || res?.data || [];
        if (mounted) {
          setSkills(rows);
          // reset choices for fresh type
          const next = {};
          rows.forEach(s => { next[s.id] = { checked: false, years: "", cert: "" }; });
          setChosen(next);
        }
      } catch (e) {
        console.error("[UI] getSkillsByWorkerType error:", e);
        toast.error(t("common.error"));
      } finally {
        setLoadingSkills(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedTypeId, t]);

  const selectedSkillsPayload = useMemo(() => {
    const list = [];
    for (const [id, info] of Object.entries(chosen)) {
      if (info?.checked) {
        const row = { skill_id: id };
        if (info.years !== "" && info.years !== undefined && info.years !== null) {
          const n = Number(info.years);
          if (!Number.isNaN(n)) row.years_of_experience = n;
        }
        if (info.cert) row.certification = info.cert;
        list.push(row);
      }
    }
    return list;
  }, [chosen]);

  const onToggleSkill = (skillId) => {
    setChosen((prev) => {
      const cur = prev[skillId] || { checked: false, years: "", cert: "" };
      return { ...prev, [skillId]: { ...cur, checked: !cur.checked } };
    });
  };

  const onChangeYears = (skillId, val) => {
    setChosen((prev) => ({ ...prev, [skillId]: { ...(prev[skillId] || {}), years: val } }));
  };
  const onChangeCert = (skillId, val) => {
    setChosen((prev) => ({ ...prev, [skillId]: { ...(prev[skillId] || {}), cert: val } }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error(t("company.missingCompanyId") || "Missing company id");
      return;
    }
    if (!fullName.trim()) {
      toast.error(t("workers.fullNameRequired") || "Full name is required");
      return;
    }

    const payload = {
      company_id: companyId,
      full_name: fullName.trim(),
      nationality: nationality || undefined,
      phone: phone || undefined,
      gender: gender || undefined,
      worker_type_id: selectedTypeId || undefined,
      // IMPORTANT: normalized path
      skills: selectedSkillsPayload.length ? selectedSkillsPayload : undefined,
    };

    console.log("[UI] submit payload:", payload);

    try {
      setSubmitting(true);
      const res = await addCompanyWorker(companyId, payload, imageFile || null);
      console.log("[UI] create worker response:", res?.data);
      toast.success(t("workers.addedSuccessfully") || "Worker added");
      // go back to list (adjust path to your dashboard route)
      router.push(`/dashboard/users?companyId=${companyId}`);
    } catch (err) {
      console.error("[UI] createCompanyWorker error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("common.error");
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{t("workers.addWorker")}</h1>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        {/* Full name */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.fullName")}</label>
          <input
            className={styles.input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("workers.fullNamePlaceholder")}
          />
        </div>

        {/* Nationality */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.nationality")}</label>
          <select
            className={styles.select}
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.phone")}</label>
          <input
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+9647…"
          />
        </div>

        {/* Gender */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.gender")}</label>
          <select
            className={styles.select}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="male">{t("workers.genderMale")}</option>
            <option value="female">{t("workers.genderFemale")}</option>
          </select>
        </div>

        {/* Worker Type */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.workerType")}</label>
          <select
            className={styles.select}
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            disabled={loadingTypes}
          >
            <option value="">{t("common.select")}</option>
            {types.map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name}
              </option>
            ))}
          </select>
          {loadingTypes && <small className={styles.hint}>{t("common.loading")}</small>}
        </div>

        {/* Skills (depend on worker type) */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.skills")}</label>

          {!selectedTypeId ? (
            <div className={styles.muted}>{t("workers.selectTypeFirst")}</div>
          ) : loadingSkills ? (
            <div className={styles.muted}>{t("common.loading")}</div>
          ) : skills.length === 0 ? (
            <div className={styles.muted}>{t("workers.noSkillsForType")}</div>
          ) : (
            <div className={styles.skillsGrid}>
              {skills.map((s) => {
                const c = chosen[s.id] || {};
                return (
                  <div key={s.id} className={styles.skillCard}>
                    <label className={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={!!c.checked}
                        onChange={() => onToggleSkill(s.id)}
                      />
                      <span>{s.name}</span>
                    </label>

                    {c.checked && (
                      <div className={styles.skillExtras}>
                        <div className={styles.skillExtraField}>
                          <span className={styles.extraLabel}>{t("workers.years")}</span>
                          <input
                            type="number"
                            min={0}
                            max={60}
                            className={styles.input}
                            value={c.years ?? ""}
                            onChange={(e) => onChangeYears(s.id, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className={styles.skillExtraField}>
                          <span className={styles.extraLabel}>{t("workers.certification")}</span>
                          <input
                            className={styles.input}
                            value={c.cert ?? ""}
                            onChange={(e) => onChangeCert(s.id, e.target.value)}
                            placeholder={t("workers.certPlaceholder")}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image */}
        <div className={styles.field}>
          <label className={styles.label}>{t("workers.image")}</label>
          <input
            className={styles.input}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <small className={styles.hint}>{t("workers.imageHint")}</small>
        </div>

        {/* Submit */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submit}
            disabled={submitting}
          >
            {submitting ? t("common.saving") : t("common.save")}
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => router.back()}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
