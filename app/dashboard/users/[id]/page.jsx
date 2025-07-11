"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { updateCompanyWorker, getCompanyWorkers } from "@/app/lib/api";
import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function EditUserPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const workerId = params.id;
    
    const companyId = "6c886af4-701a-4133-b68f-1647ad3efcad";

    const [formData, setFormData] = useState({
        full_name: "",
        nationality: "",
        phone: "",
        gender: "",
    });

    const [skills, setSkills] = useState([
        { skill_name: "", years_of_experience: "", certification: "" }
    ]);

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const { data } = await getCompanyWorkers(companyId);
                const worker = data.data.find(w => w.id === workerId);

                if (worker) {
                    setFormData({
                        full_name: worker.full_name || "",
                        nationality: worker.nationality || "",
                        phone: worker.phone || "",
                        gender: worker.gender || "",
                    });

                    if (worker.workerSkills && worker.workerSkills.length > 0) {
                        setSkills(
                            worker.workerSkills.map(s => ({
                                skill_name: s.skill_name || "",
                                years_of_experience: s.years_of_experience?.toString() || "",
                                certification: s.certification || ""
                            }))
                        );
                    } else {
                        setSkills([{ skill_name: "", years_of_experience: "", certification: "" }]);
                    }
                } else {
                    toast.error(t("workerNotFound", { defaultValue: "Worker not found." }));
                    router.push("/dashboard/users");
                }
            } catch (error) {
                console.error(error);
                toast.error(t("loadWorkerError", { defaultValue: "Failed to load worker data." }));
            }
        };

        if (workerId) fetchWorker();
    }, [workerId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillChange = (index, e) => {
        const updatedSkills = [...skills];
        updatedSkills[index][e.target.name] = e.target.value;
        setSkills(updatedSkills);
    };

    const addSkillField = () => {
        setSkills([...skills, { skill_name: "", years_of_experience: "", certification: "" }]);
    };

    const removeSkillField = (index) => {
        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedSkills = skills
            .filter(s => s.skill_name.trim() !== "")
            .map(s => ({
                skill_name: s.skill_name.trim(),
                years_of_experience: s.years_of_experience ? parseInt(s.years_of_experience) : null,
                certification: s.certification.trim() || null,
            }));

        if (formattedSkills.length === 0) {
            toast.error(t("pleaseAddSkill", { defaultValue: "Please add at least one skill with a name." }));
            return;
        }

        const updatedWorker = {
            full_name: formData.full_name,
            nationality: formData.nationality,
            phone: formData.phone,
            gender: formData.gender,
            workerSkills: formattedSkills,
        };

        try {
            await updateCompanyWorker(workerId, updatedWorker);
            toast.success(t("workerUpdated", { defaultValue: "Worker updated successfully!" }));
            router.push("/dashboard/users");
        } catch (error) {
            console.error(error);
            toast.error(t("updateWorkerError", { defaultValue: "Failed to update worker." }));
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    className={styles.input}
                    name="full_name"
                    placeholder={t("fullName", { defaultValue: "Full Name" })}
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                />
                <input
                    className={styles.input}
                    name="nationality"
                    placeholder={t("nationality", { defaultValue: "Nationality" })}
                    value={formData.nationality}
                    onChange={handleChange}
                />
                <input
                    className={styles.input}
                    name="phone"
                    placeholder={t("phone", { defaultValue: "Phone" })}
                    value={formData.phone}
                    onChange={handleChange}
                />
                <input
                    className={styles.input}
                    name="gender"
                    placeholder={t("gender", { defaultValue: "Gender" })}
                    value={formData.gender}
                    onChange={handleChange}
                />

                <h4>{t("skills", { defaultValue: "Skills" })}</h4>
                {skills.map((skill, index) => (
                    <div key={index} className={styles.skillGroup}>
                        <input
                            className={styles.input}
                            name="skill_name"
                            placeholder={t("skillName", { defaultValue: "Skill Name" })}
                            value={skill.skill_name}
                            onChange={(e) => handleSkillChange(index, e)}
                            required
                        />
                        <input
                            className={styles.input}
                            name="years_of_experience"
                            placeholder={t("yearsOfExperience", { defaultValue: "Years of Experience (optional)" })}
                            type="number"
                            value={skill.years_of_experience}
                            onChange={(e) => handleSkillChange(index, e)}
                        />
                        <input
                            className={styles.input}
                            name="certification"
                            placeholder={t("certification", { defaultValue: "Certification (optional)" })}
                            value={skill.certification}
                            onChange={(e) => handleSkillChange(index, e)}
                        />
                        {skills.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSkillField(index)}
                                className={styles.button}
                            >
                                {t("remove", { defaultValue: "Remove" })}
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addSkillField} className={styles.button}>
                    {t("addAnotherSkill", { defaultValue: "Add Another Skill" })}
                </button>

                <button type="submit" className={styles.button}>
                    {t("updateWorker", { defaultValue: "Update Worker" })}
                </button>
            </form>
        </div>
    );
}
