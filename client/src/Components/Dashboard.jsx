import React from "react";
import styles from "./Dashboard.module.css";
import InsightLogo from "../assets/Insight.png";

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <img
        src={InsightLogo}
        alt="Insight Background"
        className={styles.logoTopRight}
      />
      <img
        src={InsightLogo}
        alt="Insight Background"
        className={styles.logoBottomLeft}
      />
      <div className={styles.content}>
        <h1>Welcome Kupal</h1>
      </div>

    </div>
  );
};

export default Dashboard;
