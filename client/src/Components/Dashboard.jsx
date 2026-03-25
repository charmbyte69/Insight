import React, { useState, useEffect } from "react";
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
import { addData } from "../api/data";
import { getHistory, deleteHistory} from "../api/history";

const Dashboard = () => {
  const [manualGrades, setManualGrades] = useState("");
  const [manualIntervals, setManualIntervals] = useState("");
  const [manualRange, setManualRange] = useState("");
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
  const [groupStats, setGroupStats] = useState({
    mean: 0,
    median: 0,
    mode: 0,
  });
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
  const instructorId = localStorage.getItem("instructorId");
  const token = localStorage.getItem("token");

  // TEMP USER DATA (later from backend)
  const [user, setUser] = useState({
    name: "Justine Nabunturan",
    instructorId: "PGCSTZ6324",
    avatar: null,
  });

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




  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setImportHistory(response.data);
      } catch (error) {
        console.error("Failed to load import history:", error);
      }
    };

    fetchHistory(); // runs after login/page load
  }, [ungroupData]);
  
  

  

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
  const handleDeleteSelected = async () => {
    try {
      await deleteHistory(selectedRows);

      // ✅ update UI after backend success
      setImportHistory((prev) =>
        prev.filter((item) => !selectedRows.includes(item.DataId))
      );

      setSelectedRows([]);
      setShowDelete(false);

    } catch (error) {
  console.error("❌ FULL ERROR:", error);

  if (error.response) {
      console.error("🔴 Backend Response:", error.response.data);
      alert(error.response.data.detail || "Backend error");
    } else {
      alert("Network or server error");
    }
  }
};

  const confirmDelete = () => {
    handleDeleteSelected();
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleManualImport = async () => {
    try {
      // 🔢 Convert input string into numbers
      const grades = manualGrades
        .split(/[\s,]+/)
        .map(Number)
        .filter((num) => !isNaN(num));

      if (grades.length === 0) {
        alert("Please enter valid numeric grades");
        return;
      }

      const freqMap = {};
      grades.forEach((g) => {
        freqMap[g] = (freqMap[g] || 0) + 1;
      });

      const ungroupMapped = Object.keys(freqMap).map((key) => ({
        grade: Number(key),
        freq: freqMap[key],
      }));

      setUngroupData(ungroupMapped);

      const min = Math.min(...grades);
      const max = Math.max(...grades);

      const { date, time } = getDateTime();

      const payload = {
        DataId: Date.now(),
        Values: grades,
        Min: min,
        Max: max,
        Class_interval: Number(manualIntervals) || 0,
        FileName: "MANUAL",
        FileType: "MANUAL",
        Date: date,
        Time: time,
      };

      console.log("📦 Payload:", payload); // DEBUG

      const response = await addData(payload);

      console.log("✅ Data saved:", response.data);

      const newImport = {
        DataId: payload.DataId,
        FileName: payload.FileName,
        FileType: payload.FileType,
        Date: payload.Date,
        Time: payload.Time,
      };

      setImportHistory((prev) => [newImport, ...prev]);

      alert("Manual data imported successfully!");

    } catch (error) {
      console.error("❌ FULL ERROR:", error);

      if (error.response) {
        console.error("🔴 Backend Response:", error.response.data);
        alert(error.response.data.detail || "Backend error");
      } else if (error.request) {
        console.error("🟡 No response:", error.request);
        alert("Server not responding");
      } else {
        alert(error.message);
      }
    }
  };

  /* DRAG & DROP FUNCTIONS */
  const handleImportData = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    try {
      // 📥 Read Excel file
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!json || json.length === 0) {
        alert("Empty or invalid Excel file");
        return;
      }

      // 🔍 Get header row
      const header = json[0];

      // 🔍 Find "Grades" column (flexible match)
      const gradeIndex = header.findIndex(
        (col) =>
          col &&
          col.toString().toLowerCase().includes("grade")
      );

      if (gradeIndex === -1) {
        alert('No "Grades" column found in file');
        return;
      }

      // 🔢 Extract grades under that column
      const grades = json
        .slice(1)
        .map((row) => row[gradeIndex])
        .filter((val) => typeof val === "number");

      if (grades.length === 0) {
        alert("No valid grades found under 'Grades' column");
        return;
      }

      // ✅ 🔥 MAP TO UNGROUP TABLE WITH FREQUENCY
      const freqMap = {};
      grades.forEach((g) => {
        freqMap[g] = (freqMap[g] || 0) + 1;
      });

      const ungroupMapped = Object.keys(freqMap).map((key) => ({
        grade: Number(key),
        freq: freqMap[key],
      }));

      setUngroupData(ungroupMapped);

      // 📊 Compute min & max
      const min = Math.min(...grades);
      const max = Math.max(...grades);

      // 🕒 Get date & time
      const { date, time } = getDateTime();

      // 📦 Payload for backend
      const payload = {
        DataId: Date.now(),
        Values: grades,
        Min: min,
        Max: max,
        Class_interval: Number(intervalCount) || 0,
        FileName: selectedFile.name,
        FileType: selectedFile.name.split(".").pop(),
        Date: date,
        Time: time,
      };

      // 🚀 Send to backend
      const response = await addData(payload);

      console.log("✅ Data saved:", response.data);

      // ✅ Update import history
      const newImport = {
        id: payload.DataId,
        name: payload.FileName,
        type: payload.FileType,
        date: payload.Date,
        time: payload.Time,
        data: grades,
        ranges: rangeInput,
      };

      setImportHistory((prev) => [newImport, ...prev]);

      alert("Data imported successfully!");

    } catch (error) {
    console.error("❌ FULL ERROR:", error);

    if (error.response) {
      console.error("🔴 Backend Response:", error.response.data);
      alert(error.response.data.detail || "Backend error");
    } else {
      alert("Network or server error");
    }
}
  };

  const handleViewData = (item) => {
    console.log("Viewing DataId:", item.DataId); // debug

    fetchComputedData(item.DataId);
  };

  const fetchComputedData = async (dataId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/data/view_data/${dataId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await res.json();

      const mapped = mapBackendData(data);

      // 🔥 distribute to states
      setStats(mapped.ungroupStats);
      setUngroupData(mapped.ungroupTable);

      setGroupStats(mapped.groupStats);
      setGroupData(mapped.groupTable);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const mapBackendData = (data) => {
    // 🔹 UNGROUP
    const ungroupStats = {
      mean: data.ungroup_data.statistics.mean,
      median: data.ungroup_data.statistics.median,
      mode: data.ungroup_data.statistics.mode
    };

    const freqTable = data.ungroup_data.statistics.frequency_table;

    const ungroupTable = Object.entries(freqTable).map(([grade, freq]) => ({
      grade: Number(grade),
      freq: freq
    }));

    // 🔹 GROUP
    const table = data.group_data.table;

    const rows = table[0].interval.map((interval, i) => ({
      interval: interval,
      freq: table[3].f[i],
      xi: table[4].xi[i],
      fixi: table[5].fixi[i],
      cf: table[6].cf[i],
      boundaries: table[1].boundaries[i],
      width: table[2].width[i]
    }));

    const groupStats = {
      mean: data.group_data.mean,
      median: data.group_data.median,
      mode: data.group_data.mode
    };

    return {
      ungroupStats,
      ungroupTable,
      groupStats,
      groupTable: rows
    };
  };

  const handleUngroupComputation = async () => {
    try {
      
      const res = await fetch(`http://localhost:8000/data/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

      const data = await res.json();

      setStats({
        mean: data.ungroup_data.statistics.mean,
        median: data.ungroup_data.statistics.median,
        mode: data.ungroup_data.statistics.mode
      });

    } catch (error) {
      console.error("Error fetching data:", error);
    }    

  }

  const handleGroupDataComputation = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/data/${instructorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await res.json();

      const table = data.group_data.table;

      // Extract arrays
      const intervals = table[0].interval;
      const boundaries = table[1].boundaries;
      const widths = table[2].width;
      const frequencies = table[3].f;
      const xis = table[4].xi;
      const fixis = table[5].fixi;
      const cfs = table[6].cf;

      // Convert columns → rows
      const rows = intervals.map((interval, i) => ({
        interval: interval,
        freq: frequencies[i],
        xi: xis[i],
        fixi: fixis[i],
        cf: cfs[i],
        boundaries: boundaries[i],
        width: widths[i]
      }));

      setGroupStats({
        mean: data.group_data.mean,
        median: data.group_data.median,
        mode: data.group_data.mode,
      });

      setGroupData(rows);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleUngroupDataDisplay = async () => {
    try {
      
      const res = await fetch(`http://localhost:8000/data/${instructorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

      const data = await res.json();
      console.log("Instructor ID:", instructorId);
      console.log("data", data);
      const freqTable = data.ungroup_data.statistics.frequency_table;

      // convert object → array
      const formatted = Object.entries(freqTable).map(([grade, freq]) => ({
        grade: Number(grade),
        freq: freq
      }));

      setUngroupData(formatted);

    } catch (error) {
      console.error("Error fetching data:", error);
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

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
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
        <div className={styles.mainLayout}>START
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
                            <td>{row.xi}</td>
                            <td>{row.fixi}</td>
                            <td>{row.cf}</td>
                            <td>{row.boundaries}</td>
                            <td>{row.width}</td>
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
                <div className={styles.cardValue}>{groupStats.mean}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.cardLabel}>MODE</div>
                <div className={styles.cardSubLabel}>Total computed data:</div>
                <div className={styles.cardValue}>{groupStats.mode}</div>
              </div>
            </div>

            <div className={styles.medianCard}>
              <div className={styles.cardLabel}>MEDIAN</div>
              <div className={styles.cardSubLabel}>Total computed data:</div>
              <div className={styles.cardValue}>{groupStats.median}</div>
            </div>

            <button className={styles.computeButton}
              onClick= {() => {
                handleUngroupDataDisplay();
                handleUngroupComputation();
                handleGroupDataComputation();
              }}
            >
              START COMPUTATION
            </button>
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
                <div className={styles.cardValue}>{Array.isArray(stats.mode)
    ? stats.mode.join(", ")
    : stats.mode}</div>
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

          <div className={styles.sectionDivider}></div>

          {/* IMPORT HISTORY */}
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
                    importHistory.map((item) => (
                      <tr
                        key={item.DataId}
                        className={`${styles.historyRow} ${
                          selectedRows.includes(item.DataId) ? styles.selected : ""
                        }`}
                      >
                        <td className={styles.checkboxCell}>
                          <label className={styles.glassCheckbox}>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(item.DataId)}
                              onChange={() => handleSelectRow(item.DataId)}
                            />
                            <span className={styles.checkmark}></span>
                          </label>
                        </td>

                        <td>{item.DataId}</td>
                        <td>{item.FileName}</td>
                        <td>{item.FileType}</td>
                        <td>{item.Date}</td>
                        <td>{item.Time}</td>
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
                handleUngroupDataDisplay();
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
              <input
                placeholder="ex. 60, 70, 80, 90"
                value={manualGrades}
                onChange={(e) => setManualGrades(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Number of Intervals:</label>
              <input
                placeholder="ex. 5"
                value={manualIntervals}
                onChange={(e) => setManualIntervals(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Range:</label>
              <input
                placeholder="ex. 80 - 90"
                value={manualRange}
                onChange={(e) => setManualRange(e.target.value)}
              />
            </div>

            <button
              className={styles.importDataBtn}
              onClick={() => {
                handleManualImport();
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
