import React, { useState } from "react";
import styles from "./Dashboard.module.css";
import InsightLogo from "../assets/Insight.png";
import FolderIcon from "../assets/folder.png";
import ExcelIcon from "../assets/excel.png";
import ManualIcon from "../assets/manual.png";
import CrossIcon from "../assets/cross.png";
import XLSIcon from "../assets/xls.png";
import TrashIcon from "../assets/trash.png";
import ViewIcon from "../assets/view.png";
import DefaultUser from "../assets/Insight.png";
import PenIcon from "../assets/pen.png";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Cropper from "react-easy-crop";

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
  const [importHistory, setImportHistory] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("profileData")) || {
        name: localStorage.getItem("userFirstName") || "Instructor Name",
        id: localStorage.getItem("instructorId") || "XXXXXXX",
        password: "************",
        contact: "",
        email: "",
        photo: null,
      }
    );
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedPreview, setCroppedPreview] = useState(null);

  // LOAD FROM LOCAL STORAGE
  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("profileData"));
    if (saved) {
      setProfileData(saved);

      // 🔥 ADD THIS
      setUser((prev) => ({
        ...prev,
        avatar: saved.photo,
        name: saved.name,
        instructorId: saved.id,
      }));
    }
  }, []);

  // TEMP USER DATA (later from backend)
  const [user, setUser] = useState({
    name: "Justine Nabunturan",
    instructorId: "PGCSTZ6324",
    avatar: null,
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

  // Generate ID like 372 - 92834
  const generateImportID = () => {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(10000 + Math.random() * 90000);
    return `${part1} - ${part2}`;
  };

  // Get date & time
  const getDateTime = () => {
    const now = new Date();

    const date = now.toLocaleDateString("en-US");
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { date, time };
  };

  // HANDLE CHECKBOX TOGGLE
  const handleSelectRow = (id) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        const updated = prev.filter((item) => item !== id);
        setShowDelete(updated.length > 0);
        return updated;
      } else {
        const updated = [...prev, id];
        setShowDelete(true);
        return updated;
      }
    });
  };

  // DELETE SELECTED ROWS
  const handleDeleteSelected = () => {
    setImportHistory((prev) =>
      prev.filter((item) => !selectedRows.includes(item.id)),
    );
    setSelectedRows([]);
    setShowDelete(false);
  };

  const confirmDelete = () => {
    handleDeleteSelected();
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // VIEW / RELOAD DATA FROM HISTORY
  const handleViewData = (item) => {
    const grades = item.data;

    // === RECOMPUTE STATS ===
    const mean = grades.reduce((sum, val) => sum + val, 0) / grades.length;

    const sorted = [...grades].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    const median =
      sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

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

    // === UNGROUP DATA ===
    const ungroup = Object.keys(freqMap).map((key) => ({
      grade: key,
      freq: freqMap[key],
    }));

    setUngroupData(ungroup);

    // === GROUP DATA ===
    if (item.ranges) {
      const ranges = item.ranges.split(",").map((r) => r.trim());

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

    const rawData = grades;
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
    // SAVE TO IMPORT HISTORY
    const { date, time } = getDateTime();

    const newImport = {
      id: generateImportID(),
      name: selectedFile.name,
      type: selectedFile.name.split(".").pop(),
      date,
      time,
      data: rawData,
      ranges: rangeInput,
    };

    setImportHistory((prev) => [newImport, ...prev]);
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

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // redirect to login
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropModal(true); // OPEN CROPPER
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg();

      setProfileData((prev) => ({
        ...prev,
        photo: croppedImage,
      }));

      setUser((prev) => ({
        ...prev,
        avatar: croppedImage, // 🔥 updates top right
      }));
    }

    localStorage.setItem("profileData", JSON.stringify(profileData));

    setShowCropModal(false);
    setIsEditing(false);
    setShowProfileModal(false);
  };

  const chartData = groupData.map((item) => ({
    interval: item.interval,
    frequency: item.freq,
  }));

  const ungroupChartData = ungroupData.map((item) => ({
    grade: item.grade,
    frequency: item.freq,
  }));

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);

    const croppedImg = await generateCroppedPreview(croppedAreaPixels);
    setCroppedPreview(croppedImg);
  };

  const getCroppedImg = async () => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const size = 300;

    canvas.width = size;
    canvas.height = size;

    // 🔥 FORCE SQUARE CROP
    const minSize = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      minSize,
      minSize,
      0,
      0,
      size,
      size,
    );

    return canvas.toDataURL("image/jpeg");
  };

  const generateCroppedPreview = async (croppedAreaPixels) => {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const size = 300;

    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size,
    );

    return canvas.toDataURL("image/jpeg");
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Background Logos */}
      <img src={InsightLogo} alt="bg" className={styles.logoTopRight} />
      <img src={InsightLogo} alt="bg" className={styles.logoBottomLeft} />
      <img src={InsightLogo} alt="bg" className={styles.logoCenterLeft} />
      <img src={InsightLogo} alt="bg" className={styles.logoBottomRight} />
      <div className={styles.content}>
        {/* HEADER */}
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Group Data</h1>

          <button className={styles.importButton} onClick={openChoiceModal}>
            <img src={FolderIcon} alt="import" />
            Import Data
          </button>
        </div>
        {/* PROFILE (TOP RIGHT FLOATING) */}
        <div className={styles.profileWrapper}>
          <div className={styles.profileContainer}>
            <div className={styles.profileInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userId}>{user.instructorId}</span>
            </div>

            <img
              src={user.avatar || DefaultUser}
              alt="user"
              className={styles.profileAvatar}
              onClick={toggleProfileMenu}
            />

            {showProfileMenu && (
              <div className={styles.profileDropdown}>
                <button
                  className={styles.profileOption}
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}
                >
                  Profile
                </button>
                <button className={styles.profileOption} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
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
                <div className={styles.cardSubLabel}>Total computed data:</div>
                <div className={styles.cardValue}>{stats.mean}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
                <div className={styles.cardSubLabel}>Total computed data:</div>
                <div className={styles.cardValue}>{stats.mode}</div>
              </div>
            </div>

            <div className={styles.medianCard}>
              <div className={styles.cardLabel}>MEDIAN</div>
              <div className={styles.cardSubLabel}>Total computed data:</div>
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
                <div className={styles.cardSubLabel}>Total computed data:</div>
                <div className={styles.cardValue}>{stats.mean}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MEDIAN</div>
                <div className={styles.cardSubLabel}>Total computed data:</div>
                <div className={styles.cardValue}>{stats.median}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
                <div className={styles.cardSubLabel}>Total computed data:</div>
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
        {/* INSIGHTS SECTION */}
        <div className={styles.sectionDivider}></div>
        <h1 className={styles.title}>Insights</h1>
        <div className={styles.insightContainer}>
          {" "}
          {/* ✅ ADD THIS */}
          {/* GROUP GRAPH */}
          <div className={styles.insightCard}>
            <h2 className={styles.chartTitle}>Group Data</h2>

            <div className={styles.chartWrapper}>
              <span className={styles.yAxisLabel}>Frequency</span>

              <ResponsiveContainer width="100%" height={530}>
                <BarChart data={chartData}>
                  <XAxis dataKey="interval" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />

                  <Bar
                    dataKey="frequency"
                    radius={[10, 10, 0, 0]}
                    fill="rgba(255,255,255,0.18)"
                  />
                </BarChart>
              </ResponsiveContainer>

              <span className={styles.xAxisLabel}>Grades Interval</span>
            </div>
          </div>
          {/* UNGROUP GRAPH */}
          <div className={styles.insightCard}>
            <h2 className={styles.chartTitle}>Ungroup Data</h2>

            <div className={styles.chartWrapper}>
              <span className={styles.yAxisLabel}>Frequency</span>

              <ResponsiveContainer width="100%" height={530}>
                <LineChart data={ungroupChartData}>
                  <XAxis dataKey="grade" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="frequency"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <span className={styles.xAxisLabel}>Student Grades</span>
            </div>
          </div>
        </div>{" "}
        {/* ✅ END CONTAINER */}
        <div className={styles.sectionDivider}></div>
        <h1 className={styles.title}>Import History</h1>
        <div className={styles.historyTable}>
          <div className={styles.historyWrapper}>
          <table>
            <thead>
              <tr>
                <th className={styles.checkboxHeader}>
                  {showDelete && (
                    <img
                      src={TrashIcon}
                      alt="delete"
                      className={styles.trashIcon}
                      onClick={() => setShowDeleteModal(true)}
                    />
                  )}
                </th>
                <th>ID</th>
                <th>File Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {importHistory.length > 0 ? (
                importHistory.map((item, i) => (
                  <tr
                    key={i}
                    className={`${styles.historyRow} ${
                      selectedRows.includes(item.id) ? styles.selected : ""
                    }`}
                  >
                    {/* CHECKBOX COLUMN */}
                    <td className={styles.checkboxCell}>
                      <label className={styles.glassCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                    </td>

                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.date}</td>
                    <td>{item.time}</td>
                    <td className={styles.viewCell}>
                      <img
                        src={ViewIcon}
                        alt="view"
                        className={styles.viewIcon}
                        onClick={() => handleViewData(item)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className={styles.emptyRow}>
                  <td colSpan="7" className={styles.emptyCell}>
                    No import history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                handleImportData();
                closeAllModals();
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

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <p className={styles.deleteText}>
              Do you want to permanently delete this file?
            </p>

            <button className={styles.deleteYes} onClick={confirmDelete}>
              Yes, Delete this file!
            </button>

            <button className={styles.deleteNo} onClick={cancelDelete}>
              No, Keep this file!
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.profileModal}>
            {/* CLOSE BUTTON */}
            <img
              src={CrossIcon}
              alt="close"
              className={styles.profileClose}
              onClick={() => setShowProfileModal(false)}
            />

            {/* EDIT BUTTON */}
            <img
              src={PenIcon}
              alt="edit"
              className={styles.profileEdit}
              onClick={handleEditToggle}
            />

            <h2 className={styles.profileTitle}>Instructor Profile</h2>

            {/* PROFILE IMAGE */}
            <div className={styles.profileImageWrapper}>
              <label>
                <input type="file" hidden onChange={handlePhotoUpload} />

                <div className={styles.profileImage}>
                  {croppedPreview ? (
                    <img
                      src={croppedPreview} // 🔥 LIVE CROPPED IMAGE
                      alt="preview"
                      className={styles.profilePreview}
                    />
                  ) : profileData.photo ? (
                    <img
                      src={profileData.photo}
                      alt="profile"
                      className={styles.profilePreview}
                    />
                  ) : (
                    <span>Upload a picture</span>
                  )}
                </div>
              </label>
            </div>

            {/* INFO GRID */}
            <div className={styles.profileGrid}>
              {/* LEFT LABELS */}
              <div className={styles.profileLabels}>
                <p>Instructor Full Name:</p>
                <p>Instructor ID:</p>
                <p>Password:</p>
                <p>Contact No:</p>
                <p>Email:</p>
              </div>

              {/* RIGHT VALUES */}
              <div className={styles.profileValues}>
                <p>{profileData.name}</p>
                <p>{profileData.id}</p>
                <p>{profileData.password}</p>

                {isEditing ? (
                  <>
                    <input
                      name="contact"
                      placeholder="Add phone number"
                      value={profileData.contact}
                      onChange={handleProfileChange}
                    />
                    <input
                      name="email"
                      placeholder="Add email address"
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </>
                ) : (
                  <>
                    <p className={styles.placeholder}>
                      {profileData.contact || "Add phone number"}
                    </p>
                    <p className={styles.placeholder}>
                      {profileData.email || "Add email address"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <button className={styles.applyBtn} onClick={handleSaveProfile}>
              Apply changes
            </button>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModal}>
            <h2 className={styles.cropTitle}>Crop Image</h2>

            <div className={styles.cropContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
            />

            <button
              className={styles.applyBtn}
              onClick={() => setShowCropModal(false)}
            >
              Done Cropping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
