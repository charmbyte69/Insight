import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import InsightLogo from "../assets/Insight.png";
import FolderIcon from "../assets/folder.png";
import ExcelIcon from "../assets/excel.png";
import ManualIcon from "../assets/manual.png";
import CrossIcon from "../assets/cross.png";
import XLSIcon from "../assets/xls.png";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [ungroupData, setUngroupData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [intervalCount, setIntervalCount] = useState("");
  const [rangeInput, setRangeInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [closingModal, setClosingModal] = useState(false);
  const [stats, setStats] = useState({
    mean: 0,
    median: 0,
    mode: 0,
  });

  /* MODAL FUNCTIONS */

  const openChoiceModal = () => setShowChoiceModal(true);
  const closeChoiceModal = () => {
    setClosingModal(true);

    setTimeout(() => {
      setShowChoiceModal(false);
      setClosingModal(false);
    }, 300);
  };

  const openUploadModal = () => {
    setShowChoiceModal(false);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setClosingModal(true);

    setTimeout(() => {
      setShowUploadModal(false);
      setClosingModal(false);
      setShowChoiceModal(true);
    }, 300);
  };

  const openManualModal = () => {
    setShowChoiceModal(false);
    setShowManualModal(true);
  };

  const closeManualModal = () => {
    setClosingModal(true);

    setTimeout(() => {
      setShowManualModal(false);
      setClosingModal(false);
      setShowChoiceModal(true);
    }, 300);
  };

  const closeAllModals = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setShowManualModal(false);
      setShowChoiceModal(false);
      setClosingModal(false);
    }, 300);
  };

  /* DRAG & DROP FUNCTIONS */
  const handleImportData = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const computeStats = (data) => {
      if (data.length === 0) return;

      // MEAN
      const mean = data.reduce((sum, val) => sum + val, 0) / data.length;

      // MEDIAN
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);

      const median =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

      // MODE
      const freqMap = {};
      let maxFreq = 0;
      let mode = sorted[0];

      sorted.forEach((num) => {
        freqMap[num] = (freqMap[num] || 0) + 1;

        if (freqMap[num] > maxFreq) {
          maxFreq = freqMap[num];
          mode = num;
        }
      });

      setStats({
        mean: mean.toFixed(1),
        median: median.toFixed(1),
        mode: mode,
      });
    };
    const data = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Extract numbers only
    const grades = json.flat().filter((val) => typeof val === "number");
    computeStats(grades);

    /* UNGROUP TABLE */
    const freqMap = {};

    grades.forEach((g) => {
      freqMap[g] = (freqMap[g] || 0) + 1;
    });

    const ungroup = Object.keys(freqMap).map((key) => ({
      grade: key,
      freq: freqMap[key],
    }));

    setUngroupData(ungroup);

    /* GROUP TABLE */
    if (rangeInput) {
      const ranges = rangeInput.split(",").map((r) => r.trim());

      const grouped = ranges.map((range) => {
        const [min, max] = range.split("-").map(Number);

        const freq = grades.filter((g) => g >= min && g < max).length;

        return {
          interval: `${min} - ${max}`,
          freq,
        };
      });

      setGroupData(grouped);
    }
  };
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
      <img src={InsightLogo} alt="bg" className={styles.logoTopRight} />
      <img src={InsightLogo} alt="bg" className={styles.logoBottomLeft} />

      <div className={styles.content}>
        {/* HEADER */}
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Group Data</h1>

          <button className={styles.importButton} onClick={openChoiceModal}>
            <img src={FolderIcon} alt="import" />
            Import Data
          </button>
        </div>

        <div className={styles.mainLayout}>
          {/* LEFT SIDE */}
          <div className={styles.tableSection}>
            <div className={styles.groupTable}>
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Class Interval</th>
                      <th>Frequency</th>
                      <th>xi</th>
                      <th>fixi</th>
                      <th>Cumulative Frequency (CF)</th>
                      <th>Boundaries</th>
                      <th>Width(h)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupData.length > 0
                      ? groupData.map((row, i) => (
                          <tr key={i}>
                            <td>{row.interval}</td>
                            <td>{row.freq}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        ))
                      : Array.from({ length: 16 }).map((_, index) => (
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
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.statsSection}>
            <div className={styles.topCards}>
              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MEAN</div>
                <div className={styles.cardSubLabel}>
                  Total computed data:
                </div>
                <div className={styles.cardValue}>{stats.mean}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
                <div className={styles.cardSubLabel}>
                  Total computed data:
                </div>
                <div className={styles.cardValue}>{stats.mode}</div>
              </div>
            </div>

            <div className={styles.medianCard}>
              <div className={styles.cardLabel}>MEDIAN</div>
              <div className={styles.cardSubLabel}>
                Total computed data:
              </div>
              <div className={styles.cardValue}>{stats.median}</div>
            </div>

            <button className={styles.computeButton}>START COMPUTATION</button>
          </div>
        </div>

        {/* DIVIDER */}
        <div className={styles.sectionDivider}></div>

        {/* UNGROUP TITLE */}
        <h1 className={styles.title}>Ungroup Data</h1>

        <div className={styles.ungroupLayout}>
          {/* LEFT */}
          <div className={styles.ungroupLeft}>
            <div className={styles.topCards}>
              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MEAN</div>
                <div className={styles.cardSubLabel}>
                  Total computed data:
                </div>
                <div className={styles.cardValue}>{stats.mean}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MEDIAN</div>
                <div className={styles.cardSubLabel}>
                  Total computed data:
                </div>
                <div className={styles.cardValue}>{stats.median}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
                <div className={styles.cardSubLabel}>
                  Total computed data:
                </div>
                <div className={styles.cardValue}>{stats.mode}</div>
              </div>
            </div>

            <div className={styles.solutionCard}>
              <div className={styles.cardLabel}>SOLUTION & FORMULA</div>
            </div>
          </div>

          {/* RIGHT TABLE */}
          <div className={styles.ungroupTable}>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Grades</th>
                    <th>Frequency</th>
                  </tr>
                </thead>

                <tbody>
                  {ungroupData.length > 0
                    ? ungroupData.map((row, i) => (
                        <tr key={i}>
                          <td>{row.grade}</td>
                          <td>{row.freq}</td>
                        </tr>
                      ))
                    : Array.from({ length: 12 }).map((_, i) => (
                        <tr key={i}>
                          <td></td>
                          <td></td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CHOOSE INPUT METHOD */}

      {showChoiceModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.importModal} ${closingModal ? styles.modalExit : styles.modalEnter}`}
          >
            <img
              src={CrossIcon}
              alt="close"
              className={styles.closeIcon}
              onClick={closeChoiceModal}
            />

            <h2 className={styles.modalTitle}>Choose input method</h2>

            <button className={styles.modalOption} onClick={openUploadModal}>
              <img src={ExcelIcon} alt="excel" />
              Import Excel File
            </button>

            <div className={styles.divider}></div>

            <button className={styles.modalOption} onClick={openManualModal}>
              <img src={ManualIcon} alt="manual" />
              Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD XLS MODAL */}

      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.uploadModal} ${closingModal ? styles.modalExit : styles.modalEnter}`}
          >
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

              <img src={XLSIcon} alt="xls" />

              {selectedFile ? (
                <p>{selectedFile.name}</p>
              ) : (
                <p>Drag and Drop a file</p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label>Number of Intervals:</label>
              <input
                placeholder="ex. 5"
                value={intervalCount}
                onChange={(e) => setIntervalCount(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Range:</label>
              <input
                placeholder="ex. 75 - 80, 80 - 85, 85 - 90"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
              />
            </div>

            <button
              className={styles.importDataBtn}
              onClick={() => {
                handleImportData(); // your existing logic
                closeAllModals(); // 🔥 auto close modal
              }}
            >
              Import Data
            </button>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}

      {showManualModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.manualModal} ${closingModal ? styles.modalExit : styles.modalEnter}`}
          >
            <img
              src={CrossIcon}
              alt="close"
              className={styles.closeIcon}
              onClick={closeManualModal}
            />

            <h2 className={styles.manualTitle}>Input Data</h2>

            <div className={styles.inputGroup}>
              <label>Student Grades:</label>
              <input placeholder="ex. 60, 70, 80, 90" />
            </div>

            <div className={styles.inputGroup}>
              <label>Number of Intervals:</label>
              <input placeholder="ex. 5" />
            </div>

            <div className={styles.inputGroup}>
              <label>Range:</label>
              <input placeholder="ex. 80 - 90" />
            </div>

            <button
              className={styles.importDataBtn}
              onClick={() => {
                handleImportData();
                closeAllModals();
              }}
            >
              Import Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
