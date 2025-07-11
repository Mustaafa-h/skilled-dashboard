"use client";

import { useEffect, useState } from "react";
import { getAllServices, deleteService, getAllSubServices, deleteSubService } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/services/page.module.css";

export default function SuperAdminServicesPage() {
    const [services, setServices] = useState([]);
    const [subServices, setSubServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const [servicesRes, subServicesRes] = await Promise.all([
                    getAllServices(),
                    getAllSubServices()
                ]);
                setServices(servicesRes.data.data || []);
                setSubServices(subServicesRes.data.data || []);
            } catch (error) {
                console.error("Error fetching services:", error);
                toast.error("Failed to fetch services.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleDeleteService = async (id) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await deleteService(id);
            toast.success("Service deleted successfully.");
            setServices((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service.");
        }
    };

    const handleDeleteSubService = async (subId) => {
        if (!confirm("Are you sure you want to delete this sub-service?")) return;
        try {
            await deleteSubService(subId);
            toast.success("Sub-service deleted successfully.");
            setSubServices((prev) => prev.filter((sub) => sub.id !== subId));
        } catch (error) {
            console.error("Error deleting sub-service:", error);
            toast.error("Failed to delete sub-service.");
        }
    };

    const handleAddService = () => {
        router.push("/dashboard-superadmin/services/add");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Services Management</h1>
            <button onClick={handleAddService} className={styles.addButton}>+ Create Service</button>

            {loading ? (
                <p>Loading services...</p>
            ) : services.length === 0 ? (
                <p>No services found.</p>
            ) : (
                <div className={styles.servicesList}>
                    {services.map((service) => (
                        <div key={service.id} className={styles.serviceCard}>
                            <h2 className={styles.serviceTitle}>{service.name}</h2>
                            <p className={styles.serviceDescription}>{service.description || "No description provided."}</p>
                            <div className={styles.buttonGroup}>
                                <Link href={`/dashboard-superadmin/services/${service.id}/edit`}>
                                    <button className={styles.button}>Edit</button>
                                </Link>
                                <button onClick={() => handleDeleteService(service.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete</button>
                                <Link href={`/dashboard-superadmin/services/${service.id}/add-sub`}>
                                    <button className={styles.button}>+ Add Sub-Service</button>
                                </Link>
                            </div>

                            <p><strong>Sub-Services:</strong></p>
                            <ul className={styles.subServiceList}>
                                {subServices.filter((sub) => sub.service_id === service.id).length > 0 ? (
                                    subServices
                                        .filter((sub) => sub.service_id === service.id)
                                        .map((sub) => (
                                            <li key={sub.id} className={styles.subServiceItem}>
                                                <div className={styles.subServiceDetails}>
                                                    <span className={styles.subServiceName}>{sub.name}</span> - {sub.description || "No description"}
                                                    <div className={styles.buttonGroup}>
                                                        <Link href={`/dashboard-superadmin/services/${service.id}/edit-sub/${sub.id}`}>
                                                            <button className={styles.button}>Edit Sub</button>
                                                        </Link>
                                                        <button onClick={() => handleDeleteSubService(sub.id)} className={`${styles.button} ${styles.deleteButton}`}>Delete Sub</button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                ) : (
                                    <li className={styles.noSubServices}>No sub-services for this service.</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
