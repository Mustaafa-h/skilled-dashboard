"use client";
import { useRouter } from "next/navigation"; // Make sure it's at the top

import { useEffect, useState } from "react";
import { getAllBanners, toggleBannerActive, deleteBanner, createBanner } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "../../ui/superadmin/banners/Banners.module.css";
import { useTranslations } from "next-intl";

export default function BannersPage() {
    const router = useRouter();
    const t = useTranslations();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBannerName, setNewBannerName] = useState("");
    const [newBannerImage, setNewBannerImage] = useState(null);

    // Fetch banners on mount
    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await getAllBanners();
            setBanners(response.data.data || []);
            console.log(banners);
        } catch (err) {
            toast.error(t("banners.toastFailedLoad"));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await toggleBannerActive(id);
            toast.success(t("banners.toastStatusUpdated"));
            fetchBanners();
        } catch (err) {
            toast.error(t("banners.toastFailedToggle"));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t("banners.deleteConfirm"))) return;
        try {
            await deleteBanner(id);
            toast.success(t("banners.toastDeleted"));
            setBanners((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            toast.error(t("banners.toastFailedDelete"));
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!newBannerName || !newBannerImage) {
            toast.error(t("banners.toastNameImageRequired"));
            return;
        }

        if (newBannerImage.size > 20 * 1024 * 1024) {
            toast.error(t("banners.toastImageTooLarge"));
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newBannerName);
            formData.append("image", newBannerImage);

            await createBanner(formData);
            toast.success(t("banners.toastAdded"));
            setNewBannerName("");
            setNewBannerImage(null);
            fetchBanners();
        } catch (err) {
            toast.error(t("banners.toastFailedAdd"));
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t("banners.title")}</h1>

            {/* Add Banner Form */}
            <form className={styles.addForm} onSubmit={handleAddBanner}>
                <input
                    type="text"
                    placeholder={t("banners.bannerNamePlaceholder")}
                    value={newBannerName}
                    onChange={(e) => setNewBannerName(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewBannerImage(e.target.files[0])}
                />
                <button type="submit">{t("banners.addBannerButton")}</button>
            </form>

            {/* Banners Grid */}

            {loading ? (
                console.log(banners),
                <p>{t("banners.loading")}</p>
            ) : (
                <div className={styles.grid}>
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className={`${styles.card} ${banner.is_active ? styles.active : ""}`}
                            onClick={() => handleToggleActive(banner.id)}
                        >
                            <img src={banner.image_url} alt={banner.name} />
                            <div className={styles.cardActions}>
                                <span>{banner.name}</span>
                                <div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(banner.id);
                                        }}
                                    >
                                        {t("banners.deleteButton")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/dashboard-superadmin/banners/${banner.id}`);
                                        }}
                                    >
                                        {t("banners.updateButton")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
