"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCompanyWorker } from "@/app/lib/api";
import styles from "./page.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function AddUserPage() {
  const t = useTranslations();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    nationality: "",
    phone: "",
    gender: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [skills, setSkills] = useState([
    { skill_name: "", years_of_experience: "", certification: "" },
  ]);

  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("companyId") : null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (index, e) => {
    const updatedSkills = [...skills];
    updatedSkills[index][e.target.name] = e.target.value;
    setSkills(updatedSkills);
  };

  const addSkillField = () => {
    setSkills([
      ...skills,
      { skill_name: "", years_of_experience: "", certification: "" },
    ]);
  };

  const removeSkillField = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedSkills = skills
      .filter((s) => s.skill_name.trim() !== "")
      .map((s) => ({
        skill_name: s.skill_name.trim(),
        years_of_experience: s.years_of_experience
          ? parseInt(s.years_of_experience)
          : null,
        certification: s.certification.trim() || null,
      }));

    if (formattedSkills.length === 0) {
      toast.error(
        t("pleaseAddSkill", {
          defaultValue: "Please add at least one skill with a name.",
        })
      );
      return;
    }

    try {
      const payload = new FormData();
      payload.append("full_name", formData.full_name);
      payload.append("nationality", formData.nationality);
      payload.append("phone", formData.phone);
      payload.append("gender", formData.gender);
      payload.append("workerSkills", JSON.stringify(formattedSkills));

      if (imageFile) {
        payload.append("image", imageFile);
        console.log("🖼️ Appended worker image:", imageFile.name);
      }

      console.log("🚀 Submitting worker payload:", Array.from(payload.entries()));

      await addCompanyWorker(companyId, payload);
      toast.success(t("workerAdded", { defaultValue: "Worker added successfully!" }));
      router.push("/dashboard/users");
    } catch (error) {
      console.error("❌ Worker add error:", error);
      toast.error(t("addWorkerError", { defaultValue: "Failed to add worker." }));
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="full_name"
          placeholder={t("fullName", { defaultValue: "Full Name" })}
          onChange={handleChange}
          required
        />
        <input
          name="nationality"
          placeholder={t("nationality", { defaultValue: "Nationality" })}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder={t("phone", { defaultValue: "Phone" })}
          onChange={handleChange}
          required
        />
        <select name="gender" id="" onSelect={handleChange} value={formData.gender} placeholder={formData.gender}>
          <option value="male">
            {t("gender")}
          </option>
          <option value="female">female</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            console.log("📸 Selected worker image:", e.target.files[0]);
          }}
        />

        <h4>{t("skills", { defaultValue: "Skills" })}</h4>
        {skills.map((skill, index) => (
          <div key={index} className={styles.skillGroup}>
            <input
              name="skill_name"
              placeholder={t("skillName", { defaultValue: "Skill Name" })}
              value={skill.skill_name}
              onChange={(e) => handleSkillChange(index, e)}
              required
            />
            <input
              name="years_of_experience"
              placeholder={t("yearsOfExperience", {
                defaultValue: "Years of Experience (optional)",
              })}
              type="number"
              value={skill.years_of_experience}
              onChange={(e) => handleSkillChange(index, e)}
            />
            <input
              name="certification"
              placeholder={t("certification", {
                defaultValue: "Certification (optional)",
              })}
              value={skill.certification}
              onChange={(e) => handleSkillChange(index, e)}
            />
            {skills.length > 1 && (
              <button
                type="button"
                onClick={() => removeSkillField(index)}
                className={styles.removeSkillButton}
              >
                {t("remove", { defaultValue: "Remove" })}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSkillField}
          className={styles.addSkillButton}
        >
          {t("addAnotherSkill", { defaultValue: "Add Another Skill" })}
        </button>

        <button type="submit">{t("addWorker", { defaultValue: "Add Worker" })}</button>
      </form>
    </div>
  );
}
