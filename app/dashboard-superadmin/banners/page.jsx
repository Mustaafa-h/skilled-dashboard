"use client";
import { useRouter } from "next/navigation"; // Make sure it's at the top

import { useEffect, useState } from "react";
import { getAllBanners, toggleBannerActive, deleteBanner, createBanner } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "../../ui/superadmin/banners/Banners.module.css";

export default function BannersPage() {
    const router = useRouter();
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
            console.log(banners)
        } catch (err) {
            toast.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await toggleBannerActive(id);
            toast.success("Banner status updated");
            fetchBanners();
        } catch (err) {
            toast.error("Failed to toggle banner");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this banner?")) return;
        try {
            await deleteBanner(id);
            toast.success("Banner deleted");
            setBanners((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            toast.error("Failed to delete banner");
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!newBannerName || !newBannerImage) {
            toast.error("Name and image are required");
            return;
        }

        if (newBannerImage.size > 20 * 1024 * 1024) {
            toast.error("Image must be less than 20MB");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", newBannerName);
            formData.append("image", newBannerImage);

            await createBanner(formData);
            toast.success("Banner added");
            setNewBannerName("");
            setNewBannerImage(null);
            fetchBanners();
        } catch (err) {
            toast.error("Failed to add banner");
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Banners</h1>

            {/* Add Banner Form */}
            <form className={styles.addForm} onSubmit={handleAddBanner}>
                <input
                    type="text"
                    placeholder="Banner name"
                    value={newBannerName}
                    onChange={(e) => setNewBannerName(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewBannerImage(e.target.files[0])}
                />
                <button type="submit">Add Banner</button>
            </form>

            {/* Banners Grid */}

            {loading ? (
                console.log(banners),
                <p>Loading banners...</p>
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
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/dashboard-superadmin/banners/${banner.id}`);
                                        }}
                                    >
                                        Update
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
