"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateBanner, getAllBanners } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "../../../ui/superadmin/shared/form.module.css";

export default function EditBannerPage() {
    const router = useRouter();
    const { id } = useParams();
    const [banner, setBanner] = useState(null);
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanner();
    }, []);

    const fetchBanner = async () => {
        try {
            const response = await getAllBanners(); // We fetch all then filter since there's no GET /banners/:id
            const found = response.data.data.find((b) => b.id === id);
            if (!found) {
                toast.error("Banner not found");
                router.push("/dashboard-superadmin/banners");
                return;
            }
            setBanner(found);
            setName(found.name);
        } catch (err) {
            toast.error("Failed to fetch banner");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (image && image.size > 20 * 1024 * 1024) {
            toast.error("Image must be under 20MB");
            return;
        }

        const formData = new FormData();
        if (image) formData.append("image", image); // 

        try {
            await updateBanner(id, formData);
            toast.success("Banner updated");
            router.push("/dashboard-superadmin/banners");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!banner) return null;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Banner</h1>

            <form className={styles.addForm} onSubmit={handleUpdate}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                {banner.image_url && (
                    <img
                        src={banner.image_url}
                        alt="Current"
                        style={{ maxHeight: "200px", borderRadius: "8px", marginTop: "1rem" }}
                    />
                )}

                <button type="submit" style={{ marginTop: "1rem" }}>
                    Save Changes
                </button>
            </form>
        </div>
    );
}
