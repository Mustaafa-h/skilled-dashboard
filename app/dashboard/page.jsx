"use client";
// import Chart from "../ui/dashboard/chart/chart";
import { useEffect, useState } from "react";
import styles from "../ui/dashboard/dashboard.module.css";
import Transactions from "../ui/dashboard/transactions/transactions";
import CompanyStatsCards from "@/app/ui/dashboard/CompanyStatsCards/CompanyStatsCards";
import TokenGenerator from "../ui/notifications/TokenGenerator";

const Dashboard = () => {

  const companyId = localStorage.getItem("companyId") || null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          <CompanyStatsCards companyId={companyId} />
        </div>
        <Transactions />
        <TokenGenerator />
        {/* <Chart /> */}
      </div>
    </div>
  );
};

export default Dashboard;
