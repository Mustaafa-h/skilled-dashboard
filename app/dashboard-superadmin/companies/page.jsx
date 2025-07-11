"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllCompanies, deleteCompany } from "@/app/lib/api";
import toast from "react-hot-toast";
import styles from "@/app/ui/superadmin/companies/page.module.css";

export default function SuperAdminCompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await getAllCompanies();
                const data = res.data?.data || [];
                setCompanies(data);
                setFilteredCompanies(data);
            } catch (error) {
                console.error("Error fetching companies:", error);
                toast.error("Failed to fetch companies.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);
        const filtered = companies.filter((company) =>
            company.name.toLowerCase().includes(value)
        );
        setFilteredCompanies(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this company?")) return;
        try {
            const res = await deleteCompany(id);
            if (res.success) {
                setCompanies((prev) => prev.filter((c) => c.id !== id));
                setFilteredCompanies((prev) => prev.filter((c) => c.id !== id));
                toast.success("Company deleted successfully.");
            }
        } catch (error) {
            console.error("Error deleting company:", error);
            const errorMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to delete company.";
            toast.error(errorMsg);
        }
    };

    const handleAddCompany = () => {
        router.push("/dashboard-superadmin/companies/add");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Companies Management</h1>
                <button onClick={handleAddCompany} className={styles.addButton}>
                    + Add Company
                </button>
            </div>

            <input
                type="text"
                placeholder="Search by name"
                value={search}
                onChange={handleSearch}
                className={styles.searchInput}
            />

            {loading ? (
                <p>Loading companies...</p>
            ) : filteredCompanies.length === 0 ? (
                <p>No companies found.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((company) => (
                            <tr
                                key={company.id}
                                onClick={() =>
                                    router.push(`/dashboard-superadmin/companies/${company.id}`)
                                }
                            >
                                <td>{company.name}</td>
                                <td className={styles.statusText}>{company.status}</td>
                                <td>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(company.id);
                                        }}
                                        className={styles.deleteButton}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
