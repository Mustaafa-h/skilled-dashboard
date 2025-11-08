"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getWorkerTypes,
  getSkillsByWorkerType,
  saCreateWorkerType,
  saUpdateWorkerType,
  saDeleteWorkerType,
  saCreateSkill,
  saUpdateSkill,
  saDeleteSkill,
} from "../../lib/api";
import styles from "../../ui/superadmin/workers/workers.module.css";

export default function SuperAdminWorkersPage() {
  const t = useTranslations();

  const [types, setTypes] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState({});
  const [error, setError] = useState(null);

  const [typeEditing, setTypeEditing] = useState(null);
  const [skillEditing, setSkillEditing] = useState(null);

  const typeDialogRef = useRef(null);
  const skillDialogRef = useRef(null);

  // ===== Load worker types =====
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("[SA Workers] Fetching worker types…");
        const res = await getWorkerTypes();
        const raw = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        const mapped = raw.map((x) => ({
          id: x.id,
          name: x.name,
          description: x.description || "",
          active: x.active !== false,
          skills: [],
        }));
        console.log("[SA Workers] Types:", mapped);
        setTypes(mapped);
      } catch (e) {
        console.error(e);
        setError(
          t("workers.errors.loadTypes", { defaultValue: "Failed to load worker types" })
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  // ===== Expand & lazy-load skills =====
  const toggleExpand = async (typeId) => {
    setExpanded((p) => ({ ...p, [typeId]: !p[typeId] }));
    const type = types.find((x) => x.id === typeId);
    if (!type) return;

    if (!expanded[typeId] && type.skills.length === 0) {
      try {
        setBusy((p) => ({ ...p, [typeId]: true }));
        console.log("[SA Workers] Loading skills for type:", typeId);
        const res = await getSkillsByWorkerType(typeId);
        const raw = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        const skills = raw.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description || "",
          active: s.active !== false,
        }));
        setTypes((prev) => prev.map((t) => (t.id === typeId ? { ...t, skills } : t)));
      } catch (e) {
        console.error(e);
        setError(t("workers.errors.loadSkills", { defaultValue: "Failed to load skills" }));
      } finally {
        setBusy((p) => {
          const n = { ...p };
          delete n[typeId];
          return n;
        });
      }
    }
  };

  // ===== Worker Type modals =====
  const openNewType = () => {
    setTypeEditing({ id: null, name: "", description: "", active: true });
    typeDialogRef.current?.showModal();
  };
  const openEditType = (type) => {
    setTypeEditing({ ...type });
    typeDialogRef.current?.showModal();
  };
  const closeTypeDialog = () => {
    setTypeEditing(null);
    typeDialogRef.current?.close();
  };

  const submitType = async (e) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      description: String(form.get("description") || "").trim() || undefined,
      active: form.get("active") === "on",
    };
    console.log("[SA Workers] Type payload:", payload, "editing:", typeEditing);

    if (!payload.name) {
      setError(t("workers.validation.nameRequired", { defaultValue: "Name is required" }));
      return;
    }

    try {
      if (typeEditing?.id) {
        setBusy((p) => ({ ...p, [typeEditing.id]: true }));
        await saUpdateWorkerType(typeEditing.id, payload);
        setTypes((prev) => prev.map((x) => (x.id === typeEditing.id ? { ...x, ...payload } : x)));
        console.log("[SA Workers] Type updated");
      } else {
        setBusy((p) => ({ ...p, __creatingType: true }));
        const res = await saCreateWorkerType(payload);
        const created = res?.data || res;
        const item = {
          id: created?.id,
          name: created?.name || payload.name,
          description: created?.description ?? payload.description ?? "",
          active: created?.active ?? payload.active ?? true,
          skills: [],
        };
        setTypes((prev) => [item, ...prev]);
        console.log("[SA Workers] Type created:", item);
      }
    } catch (e) {
      console.error(e);
      setError(t("workers.errors.saveType", { defaultValue: "Failed to save worker type" }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[typeEditing?.id];
        delete n.__creatingType;
        return n;
      });
      closeTypeDialog();
    }
  };

  const removeType = async (typeId) => {
    if (!confirm(t("workers.confirm.deleteType", { defaultValue: "Delete this worker type?" })))
      return;
    try {
      setBusy((p) => ({ ...p, [typeId]: true }));
      await saDeleteWorkerType(typeId);
      setTypes((prev) => prev.filter((x) => x.id !== typeId));
      console.log("[SA Workers] Type deleted:", typeId);
    } catch (e) {
      console.error(e);
      setError(t("workers.errors.deleteType", { defaultValue: "Failed to delete worker type" }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[typeId];
        return n;
      });
    }
  };

  // ===== Skills modals =====
  const openNewSkill = (typeId) => {
    setSkillEditing({ id: null, typeId, name: "", description: "", active: true });
    skillDialogRef.current?.showModal();
  };
  const openEditSkill = (typeId, skill) => {
    setSkillEditing({ typeId, ...skill });
    skillDialogRef.current?.showModal();
  };
  const closeSkillDialog = () => {
    setSkillEditing(null);
    skillDialogRef.current?.close();
  };

  const submitSkill = async (e) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      description: String(form.get("description") || "").trim() || undefined,
      worker_type_id: String(skillEditing?.typeId),
      active: form.get("active") === "on",
    };
    console.log("[SA Workers] Skill payload:", payload, "editing:", skillEditing);

    if (!payload.name) {
      setError(t("workers.validation.nameRequired", { defaultValue: "Name is required" }));
      return;
    }

    try {
      if (skillEditing?.id) {
        setBusy((p) => ({ ...p, [skillEditing.id]: true }));
        await saUpdateSkill(skillEditing.id, payload);
        setTypes((prev) =>
          prev.map((t) =>
            t.id === skillEditing.typeId
              ? {
                  ...t,
                  skills: t.skills.map((s) =>
                    s.id === skillEditing.id ? { ...s, ...payload } : s
                  ),
                }
              : t
          )
        );
        console.log("[SA Workers] Skill updated");
      } else {
        setBusy((p) => ({ ...p, __creatingSkill: true }));
        const res = await saCreateSkill(payload);
        const created = res?.data || res;
        const newSkill = {
          id: created?.id,
          name: created?.name || payload.name,
          description: created?.description ?? payload.description ?? "",
          active: created?.active ?? payload.active ?? true,
        };
        setTypes((prev) =>
          prev.map((t) =>
            t.id === payload.worker_type_id ? { ...t, skills: [newSkill, ...t.skills] } : t
          )
        );
        console.log("[SA Workers] Skill created:", newSkill);
      }
    } catch (e) {
      console.error(e);
      setError(t("workers.errors.saveSkill", { defaultValue: "Failed to save skill" }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[skillEditing?.id];
        delete n.__creatingSkill;
        return n;
      });
      closeSkillDialog();
    }
  };

  const removeSkill = async (typeId, skillId) => {
    if (!confirm(t("workers.confirm.deleteSkill", { defaultValue: "Delete this skill?" }))) return;
    try {
      setBusy((p) => ({ ...p, [skillId]: true }));
      await saDeleteSkill(skillId);
      setTypes((prev) =>
        prev.map((t) =>
          t.id === typeId ? { ...t, skills: t.skills.filter((s) => s.id !== skillId) } : t
        )
      );
      console.log("[SA Workers] Skill deleted:", skillId);
    } catch (e) {
      console.error(e);
      setError(t("workers.errors.deleteSkill", { defaultValue: "Failed to delete skill" }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[skillId];
        return n;
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {t("workers.title", { defaultValue: "Worker Types & Skills" })}
          </h1>
          <p className={styles.subtitle}>
            {t("workers.subtitle", {
              defaultValue:
                "Manage normalized worker types and their skills. These drive the company worker form.",
            })}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openNewType}>
            {t("workers.buttons.addType", { defaultValue: "Add Worker Type" })}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.stateBox}>
          {t("workers.loading", { defaultValue: "Loading..." })}
        </div>
      ) : (
        <div className={styles.grid}>
          {types.length === 0 ? (
            <div className={styles.stateBox}>
              {t("workers.empty", { defaultValue: "No worker types yet." })}
            </div>
          ) : (
            types.map((type) => (
              <section key={type.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardMeta}>
                    <div className={styles.typeName}>{type.name}</div>
                    {type.description ? (
                      <div className={styles.typeDesc}>{type.description}</div>
                    ) : null}
                  </div>
                  <div className={styles.rowActions}>
                    <span
                      className={`${styles.badge} ${type.active ? styles.ok : styles.muted}`}
                      title={type.active ? "active" : "inactive"}
                    >
                      {type.active
                        ? t("workers.badges.active", { defaultValue: "Active" })
                        : t("workers.badges.inactive", { defaultValue: "Inactive" })}
                    </span>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={() => openNewSkill(type.id)}
                      disabled={!!busy[type.id]}
                    >
                      {t("workers.buttons.addSkill", { defaultValue: "Add Skill" })}
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnGhost}`}
                      onClick={() => openEditType(type)}
                      disabled={!!busy[type.id]}
                    >
                      {t("workers.buttons.editType", { defaultValue: "Edit" })}
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnWarn}`}
                      onClick={() => removeType(type.id)}
                      disabled={!!busy[type.id]}
                    >
                      {t("workers.buttons.deleteType", { defaultValue: "Delete" })}
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={() => toggleExpand(type.id)}
                    >
                      {expanded[type.id]
                        ? t("workers.buttons.collapse", { defaultValue: "Collapse" })
                        : t("workers.buttons.expand", { defaultValue: "Expand" })}
                    </button>
                  </div>
                </div>

                {expanded[type.id] && (
                  <div className={styles.skillsWrap}>
                    {busy[type.id] ? (
                      <div className={styles.stateBox}>
                        {t("workers.loadingSkills", { defaultValue: "Loading skills..." })}
                      </div>
                    ) : type.skills.length === 0 ? (
                      <div className={styles.stateBox}>
                        {t("workers.noSkills", { defaultValue: "No skills for this type yet." })}
                      </div>
                    ) : (
                      <ul className={styles.skills}>
                        {type.skills.map((sk) => (
                          <li key={sk.id} className={styles.skill}>
                            <div className={styles.skillMeta}>
                              <div className={styles.skillName}>{sk.name}</div>
                              {sk.description ? (
                                <div className={styles.skillDesc}>{sk.description}</div>
                              ) : null}
                            </div>
                            <div className={styles.skillActions}>
                              <span
                                className={`${styles.badge} ${
                                  sk.active ? styles.ok : styles.muted
                                }`}
                              >
                                {sk.active
                                  ? t("workers.badges.active", { defaultValue: "Active" })
                                  : t("workers.badges.inactive", { defaultValue: "Inactive" })}
                              </span>
                              <button
                                className={`${styles.btn} ${styles.btnGhost}`}
                                onClick={() => openEditSkill(type.id, sk)}
                                disabled={!!busy[sk.id]}
                              >
                                {t("workers.buttons.editSkill", { defaultValue: "Edit" })}
                              </button>
                              <button
                                className={`${styles.btn} ${styles.btnWarn}`}
                                onClick={() => removeSkill(type.id, sk.id)}
                                disabled={!!busy[sk.id]}
                              >
                                {t("workers.buttons.deleteSkill", { defaultValue: "Delete" })}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      )}

      {/* ===== Type Modal ===== */}
      <dialog ref={typeDialogRef} className={styles.dialog}>
        <form className={styles.dialogCard} method="dialog" onSubmit={submitType}>
          <h3 className={styles.dialogTitle}>
            {typeEditing?.id
              ? t("workers.modals.editTypeTitle", { defaultValue: "Edit Worker Type" })
              : t("workers.modals.addTypeTitle", { defaultValue: "Add Worker Type" })}
          </h3>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("workers.fields.typeName", { defaultValue: "Name" })}{" "}
              <span className={styles.req}>*</span>
            </label>
            <input
              name="name"
              defaultValue={typeEditing?.name || ""}
              placeholder={t("workers.placeholders.typeName", {
                defaultValue: "e.g. Electrician",
              })}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("workers.fields.typeDesc", { defaultValue: "Description" })}
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={typeEditing?.description || ""}
              placeholder={t("workers.placeholders.typeDesc", {
                defaultValue: "Optional context shown for admins.",
              })}
              className={styles.textarea}
            />
          </div>

          <label className={`${styles.inline} ${styles.helper}`}>
            <input type="checkbox" name="active" defaultChecked={typeEditing?.active ?? true} />
            {t("workers.fields.active", { defaultValue: "Active" })}
          </label>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={closeTypeDialog}>
              {t("workers.buttons.cancel", { defaultValue: "Cancel" })}
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {typeEditing?.id
                ? t("workers.buttons.save", { defaultValue: "Save" })
                : t("workers.buttons.create", { defaultValue: "Create" })}
            </button>
          </div>
        </form>
      </dialog>

      {/* ===== Skill Modal ===== */}
      <dialog ref={skillDialogRef} className={styles.dialog}>
        <form className={styles.dialogCard} method="dialog" onSubmit={submitSkill}>
          <h3 className={styles.dialogTitle}>
            {skillEditing?.id
              ? t("workers.modals.editSkillTitle", { defaultValue: "Edit Skill" })
              : t("workers.modals.addSkillTitle", { defaultValue: "Add Skill" })}
          </h3>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("workers.fields.skillName", { defaultValue: "Skill name" })}{" "}
              <span className={styles.req}>*</span>
            </label>
            <input
              name="name"
              defaultValue={skillEditing?.name || ""}
              placeholder={t("workers.placeholders.skillName", {
                defaultValue: "e.g. Panel wiring",
              })}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("workers.fields.skillDesc", { defaultValue: "Description" })}
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={skillEditing?.description || ""}
              placeholder={t("workers.placeholders.skillDesc", {
                defaultValue: "Optional context shown for admins.",
              })}
              className={styles.textarea}
            />
          </div>

          <label className={`${styles.inline} ${styles.helper}`}>
            <input type="checkbox" name="active" defaultChecked={skillEditing?.active ?? true} />
            {t("workers.fields.active", { defaultValue: "Active" })}
          </label>

          <div className={styles.actions}>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={closeSkillDialog}>
              {t("workers.buttons.cancel", { defaultValue: "Cancel" })}
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {skillEditing?.id
                ? t("workers.buttons.save", { defaultValue: "Save" })
                : t("workers.buttons.create", { defaultValue: "Create" })}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
