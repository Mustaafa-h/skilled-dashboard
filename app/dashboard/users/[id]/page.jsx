"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";

import {
  getCompanyWorkers,
  getWorkerTypes,
  getSkillsByWorkerType,
  updateCompanyWorker,
} from "@/app/lib/api";

const COUNTRIES = [
  "Iraq", "Jordan", "Saudi Arabia", "United Arab Emirates", "Qatar",
  "Kuwait", "Bahrain", "Oman", "Egypt", "Turkey",
  "India", "Pakistan", "United Kingdom", "United States", "Germany"
];

export default function EditUserPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const workerId = params.id;

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  // form fields
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("Iraq");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");

  const [imageFile, setImageFile] = useState(null);

  // catalog
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // chosen map: { [skill_id]: { checked, years, cert } }
  const [chosen, setChosen] = useState({});

  // track original skills so we can avoid deleting legacy accidentally
  const [initialSkillIds, setInitialSkillIds] = useState(null);

  const [loadingWorker, setLoadingWorker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1) load worker types
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        console.log("[UI] fetching worker types…");
        const res = await getWorkerTypes();
        const rows = res?.data?.data || res?.data || [];
        console.log("[UI] worker types:", rows);
        if (mounted) setTypes(rows);
      } catch (e) {
        console.error("[UI] getWorkerTypes error:", e);
        toast.error(t("Common.error"));
      } finally {
        setLoadingTypes(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  // 2) load worker (from list endpoint)
  useEffect(() => {
    if (!workerId) return;

    let mounted = true;

    (async () => {
      if (!companyId) {
        toast.error(t("company.missingCompanyId") || "Missing company id");
        return;
      }

      try {
        setLoadingWorker(true);
        console.log("[UI] loading worker from list", { companyId, workerId });

        const { data } = await getCompanyWorkers(companyId, false); // include inactive
        const rows = data?.data || [];
        const worker = rows.find((w) => w.id === workerId);

        if (!worker) {
          toast.error(t("workerNotFound", { defaultValue: "Worker not found." }));
          router.push("/dashboard/users");
          return;
        }

        console.log("[UI] worker loaded:", worker);

        if (!mounted) return;

        setFullName(worker.full_name || "");
        setNationality(worker.nationality || "Iraq");
        setPhone(worker.phone || "");
        setGender(worker.gender || "male");

        setSelectedTypeId(worker.worker_type_id || "");

        // capture initial skill ids (normalized only)
        const normalizedSkillIds =
          Array.isArray(worker.workerSkills)
            ? worker.workerSkills
                .filter((s) => !!s.skill_id)
                .map((s) => s.skill_id)
            : [];

        setInitialSkillIds(normalizedSkillIds);

        // prefill chosen map later after we fetch catalog skills for the type
        // (we store workerSkills temporarily on window for debugging)
        console.log("[UI] normalized skill ids:", normalizedSkillIds);
        window.__workerSkills = worker.workerSkills || [];
      } catch (error) {
        console.error("❌ Error loading worker:", error);
        toast.error(t("loadWorkerError", { defaultValue: "Failed to load worker data." }));
      } finally {
        setLoadingWorker(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [workerId, companyId, router, t]);

  // 3) when type changes -> fetch skills and build chosen map, preselect if possible
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
        const rows = res?.data?.data || res?.data || [];
        console.log("[UI] skills rows:", rows);

        if (!mounted) return;

        setSkills(rows);

        // build initial map from catalog skills
        const next = {};
        rows.forEach((s) => {
          next[s.id] = { checked: false, years: "", cert: "" };
        });

        // preselect from workerSkills if we have them and they are normalized
        const workerSkills = Array.isArray(window.__workerSkills) ? window.__workerSkills : [];
        for (const ws of workerSkills) {
          if (!ws?.skill_id) continue; // legacy row
          if (!next[ws.skill_id]) continue; // not in this type
          next[ws.skill_id] = {
            checked: true,
            years: ws.years_of_experience ?? "",
            cert: ws.certification ?? "",
          };
        }

        setChosen(next);
      } catch (e) {
        console.error("[UI] getSkillsByWorkerType error:", e);
        toast.error(t("Common.error"));
      } finally {
        setLoadingSkills(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedTypeId, t]);

  const selectedSkillsPayload = useMemo(() => {
    const list = [];
    for (const [id, info] of Object.entries(chosen)) {
      if (info?.checked) {
        const row = { skill_id: id };

        // keep optional + safe
        if (info.years !== "" && info.years !== undefined && info.years !== null) {
          const n = Number(info.years);
          if (!Number.isNaN(n)) row.years_of_experience = n;
        }
        if (info.cert) row.certification = String(info.cert).trim();

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
      toast.error(t("requiredField", { defaultValue: "Full name is required." }));
      return;
    }

    // IMPORTANT SAFETY:
    // Only send "skills" if worker_type_id is selected.
    // Also: if the user never touched skills and the worker was legacy-only,
    // we should NOT send skills empty (would delete legacy rows in backend update).
    // We'll send skills only when:
    // - worker_type_id is present AND
    // - (initialSkillIds is not null) (we loaded worker) AND
    // - the set of selected ids differs OR the worker has normalized skills already
    const selectedIds = selectedSkillsPayload.map((x) => x.skill_id).sort();
    const initialIds = Array.isArray(initialSkillIds) ? [...initialSkillIds].sort() : null;

    const normalizedSkillChange =
      initialIds === null
        ? false
        : JSON.stringify(selectedIds) !== JSON.stringify(initialIds);

    const payload = {
      full_name: fullName.trim(),
      nationality: nationality || undefined,
      phone: phone || undefined,
      gender: gender || undefined,
      worker_type_id: selectedTypeId || undefined,
      // send normalized skills only when it makes sense
      skills:
        selectedTypeId && (normalizedSkillChange || (initialIds && initialIds.length > 0))
          ? (selectedSkillsPayload.length ? selectedSkillsPayload : [])
          : undefined,
    };

    console.log("[UI] update payload:", payload);
    console.log("[UI] normalizedSkillChange:", normalizedSkillChange, { initialIds, selectedIds });

    try {
      setSubmitting(true);
      const res = await updateCompanyWorker(workerId, payload, imageFile || null);
      console.log("[UI] update worker response:", res?.data);
      toast.success(t("workerUpdated", { defaultValue: "Worker updated successfully!" }));
      router.push("/dashboard/users");
    } catch (error) {
      console.error("❌ Update error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        t("updateWorkerError", { defaultValue: "Failed to update worker." });

      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit} className={styles.form}>
        {loadingWorker && (
          <div style={{ opacity: 0.8, marginBottom: 12 }}>
            {t("Common.loading")}
          </div>
        )}

        <input
          className={styles.input}
          name="full_name"
          placeholder={t("fullName", { defaultValue: "Full Name" })}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <select
          className={styles.input}
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          className={styles.input}
          name="phone"
          placeholder={t("phone", { defaultValue: "Phone" })}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <select
          className={styles.input}
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="male">{t("Workers.genderMale", { defaultValue: "Male" })}</option>
          <option value="female">{t("Workers.genderFemale", { defaultValue: "Female" })}</option>
        </select>

        {/* Worker Type */}
        <select
          className={styles.input}
          value={selectedTypeId}
          onChange={(e) => setSelectedTypeId(e.target.value)}
          disabled={loadingTypes}
        >
          <option value="">{t("Common.select", { defaultValue: "Select" })}</option>
          {types.map((wt) => (
            <option key={wt.id} value={wt.id}>
              {wt.name}
            </option>
          ))}
        </select>

        {/* Skills */}
        <div style={{ marginTop: 10 }}>
          <h4 style={{ marginBottom: 8 }}>{t("skills", { defaultValue: "Skills" })}</h4>

          {!selectedTypeId ? (
            <div style={{ opacity: 0.8 }}>
              {t("Workers.selectTypeFirst", { defaultValue: "Select worker type first" })}
            </div>
          ) : loadingSkills ? (
            <div style={{ opacity: 0.8 }}>{t("Common.loading")}</div>
          ) : skills.length === 0 ? (
            <div style={{ opacity: 0.8 }}>
              {t("Workers.noSkillsForType", { defaultValue: "No skills for this type" })}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {skills.map((s) => {
                const c = chosen[s.id] || {};
                return (
                  <div key={s.id} className={styles.skillGroup}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!c.checked}
                        onChange={() => onToggleSkill(s.id)}
                      />
                      <span>{s.name}</span>
                    </label>

                    {c.checked && (
                      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                        <input
                          className={styles.input}
                          type="number"
                          min={0}
                          max={60}
                          value={c.years ?? ""}
                          onChange={(e) => onChangeYears(s.id, e.target.value)}
                          placeholder={t("yearsOfExperience", { defaultValue: "Years of Experience" })}
                        />
                        <input
                          className={styles.input}
                          value={c.cert ?? ""}
                          onChange={(e) => onChangeCert(s.id, e.target.value)}
                          placeholder={t("certification", { defaultValue: "Certification" })}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Image */}
        <input
          className={styles.input}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setImageFile(f);
            console.log("📸 Selected new image:", f?.name);
          }}
        />

        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting
            ? t("Common.saving", { defaultValue: "Saving..." })
            : t("updateWorker", { defaultValue: "Update Worker" })}
        </button>

        <button
          type="button"
          className={styles.button}
          onClick={() => router.back()}
          disabled={submitting}
          style={{ opacity: 0.85 }}
        >
          {t("Common.cancel", { defaultValue: "Cancel" })}
        </button>
      </form>
    </div>
  );
}
