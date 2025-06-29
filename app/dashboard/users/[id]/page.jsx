"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";
import Image from "next/image";

const MapPicker = dynamic(() => import("../../../ui/dashboard/users/addUser/MapPicker"), { ssr: false });

export default function SingleUserPage({ params }) {
    const { id } = params;
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState({ lat: 33.3152, lng: 44.3661 });

    useEffect(() => {
        const fetchUserData = async () => {
            const res = await fetch(`/api/get-user?id=${id}`);
            const data = await res.json();
            setUser(data);
            if (data.latitude && data.longitude) {
                setLocation({ lat: data.latitude, lng: data.longitude });
            }
        };
        fetchUserData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
        formData.append("id", id);

        const res = await fetch("/api/update-user", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            router.push("/dashboard/users");
        } else {
            console.error("Failed to update user");
        }

    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.imgContainer}>
                    <Image src={user.img || "/noavatar.png"} alt="" fill />
                </div>
                <p>{user.username}</p>
            </div>
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label>Username</label>
                    <input type="text" name="username" defaultValue={user.username} required />

                    <label>Email</label>
                    <input type="email" name="email" defaultValue={user.email} required />

                    <label>Phone</label>
                    <input type="text" name="phone" defaultValue={user.phone} />

                    <label>Status</label>
                    <select name="isActive" defaultValue={user.isActive ? "true" : "false"}>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>

                    <div className={styles.mapContainer}>
                        <MapPicker initialPosition={location} onLocationSelect={setLocation} />
                    </div>

                    <button type="submit" className={styles.button}>Update</button>
                </form>
            </div>
        </div>
    );
}
