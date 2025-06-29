
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const MapPicker = dynamic(() => import("../../../ui/dashboard/users/addUser/MapPicker"), { ssr: false });



export default function AddUserPage() {
    const router = useRouter();
    const [location, setLocation] = useState({ lat: null, lng: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);

        const res = await fetch("/api/add-user", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            router.push("/dashboard/users");
        } else {
            console.error("Failed to add user");
        }
    };


    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="text" name="username" placeholder="Username" className={styles.input} required />
                <input type="email" name="email" placeholder="Email" className={styles.input} required />
                <input type="text" name="phone" placeholder="Phone" className={styles.input} />
                <div className={styles.mapContainer}>
                    <MapPicker onLocationSelect={setLocation} />
                </div>
                <button type="submit" className={styles.button}>Add Worker</button>
            </form>
        </div>

    );
}
