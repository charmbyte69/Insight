import React, { useState } from "react";
import styles from "./Dashboard.module.css";

import InsightLogo from "../assets/Insight.png";
import FolderIcon from "../assets/folder.png";

import ExcelIcon from "../assets/excel.png";
import ManualIcon from "../assets/manual.png";
import CrossIcon from "../assets/cross.png";
import XLSIcon from "../assets/xls.png";

const Dashboard = () => {

  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  /* ======================= */
  /* MODAL FUNCTIONS */
  /* ======================= */

  const openChoiceModal = () => setShowChoiceModal(true);

  const closeChoiceModal = () => setShowChoiceModal(false);

  const openUploadModal = () => {
    setShowChoiceModal(false);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setShowChoiceModal(true);
  };

  const openManualModal = () => {
    setShowChoiceModal(false);
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setShowManualModal(false);
    setShowChoiceModal(true);
  };

  /* ======================= */
  /* DRAG & DROP FUNCTIONS */
  /* ======================= */

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];

    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
    }
  };

  const handleFileSelect = (e) => {

    const file = e.target.files[0];

    if (file && (file.name.endsWith(".xls") || file.name.endsWith(".xlsx"))) {
      setSelectedFile(file);
    } else {
      alert("Please upload a valid Excel file (.xls or .xlsx)");
    }

  };

  return (
    <div className={styles.dashboardContainer}>

      {/* Background Logos */}
      <img src={InsightLogo} alt="bg" className={styles.logoTopRight}/>
      <img src={InsightLogo} alt="bg" className={styles.logoBottomLeft}/>

      <div className={styles.content}>

        <h1 className={styles.title}>Statistics</h1>

        <div className={styles.mainLayout}>

          {/* LEFT SIDE */}
          <div className={styles.tableSection}>

            <button className={styles.importButton} onClick={openChoiceModal}>
              <img src={FolderIcon} alt="import"/>
              Import Data
            </button>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Class Interval</th>
                    <th>Frequency</th>
                    <th>xi</th>
                    <th>fixi</th>
                    <th>Cumulative Frequency</th>
                    <th>Boundaries</th>
                    <th>Width(h)</th>
                  </tr>
                </thead>

                <tbody>
                  {Array.from({ length: 20 }).map((_, index) => (
                    <tr key={index}>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className={styles.statsSection}>

            <div className={styles.topCards}>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MEAN</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
              </div>

            </div>

            <div className={styles.medianCard}>
              <div className={styles.cardLabel}>MEDIAN</div>
            </div>

            <button className={styles.computeButton}>
              START COMPUTATION
            </button>

          </div>

        </div>
      </div>

      {/* ============================= */}
      {/* CHOOSE INPUT METHOD */}
      {/* ============================= */}

      {showChoiceModal && (
        <div className={styles.modalOverlay}>

          <div className={styles.importModal}>

            <img
              src={CrossIcon}
              alt="close"
              className={styles.closeIcon}
              onClick={closeChoiceModal}
            />

            <h2 className={styles.modalTitle}>Choose input method</h2>

            <button className={styles.modalOption} onClick={openUploadModal}>
              <img src={ExcelIcon} alt="excel"/>
              Import Excel File
            </button>

            <div className={styles.divider}></div>

            <button className={styles.modalOption} onClick={openManualModal}>
              <img src={ManualIcon} alt="manual"/>
              Manual Entry
            </button>

          </div>

        </div>
      )}

      {/* ============================= */}
      {/* UPLOAD XLS MODAL */}
      {/* ============================= */}

      {showUploadModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.uploadModal}>

            <img
              src={CrossIcon}
              alt="close"
              className={styles.closeIcon}
              onClick={closeUploadModal}
            />

            <h2 className={styles.modalTitle}>Upload XLS File</h2>

            <div
              className={`${styles.dragArea} ${dragActive ? styles.dragActive : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >

              <input
                type="file"
                accept=".xls,.xlsx"
                className={styles.fileInput}
                onChange={handleFileSelect}
              />

              <img src={XLSIcon} alt="xls"/>

              {selectedFile ? (
                <p>{selectedFile.name}</p>
              ) : (
                <p>Drag and Drop a file</p>
              )}

            </div>

            <div className={styles.inputGroup}>
              <label>Number of Intervals:</label>
              <input placeholder="ex. 5"/>
            </div>

            <div className={styles.inputGroup}>
              <label>Range:</label>
              <input placeholder="ex. 75 - 80, 80 - 85, 85 - 90"/>
            </div>

            <button className={styles.importDataBtn}>
              Import Data
            </button>

          </div>

        </div>

      )}

      {/* ============================= */}
      {/* MANUAL ENTRY MODAL */}
      {/* ============================= */}

      {showManualModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.manualModal}>

            <img
              src={CrossIcon}
              alt="close"
              className={styles.closeIcon}
              onClick={closeManualModal}
            />

            <h2 className={styles.manualTitle}>Input Data</h2>

            <div className={styles.inputGroup}>
              <label>Student Grades:</label>
              <input placeholder="ex. 60, 70, 80, 90"/>
            </div>

            <div className={styles.inputGroup}>
              <label>Number of Intervals:</label>
              <input placeholder="ex. 5"/>
            </div>

            <div className={styles.inputGroup}>
              <label>Range:</label>
              <input placeholder="ex. 80 - 90"/>
            </div>

            <button className={styles.importDataBtn}>
              Import Data
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Dashboard;