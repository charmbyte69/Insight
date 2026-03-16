import React, { useState } from "react";
import styles from "./Register.module.css";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import userIcon from "../assets/user.png";
import idIcon from "../assets/id.png";
import passIcon from "../assets/passkey.png";
import arrowIcon from "../assets/arrow.png";
import logo from "../assets/Logoo.png";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    instructorId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.instructorId ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await registerUser({
        instructor_id: formData.instructorId,
        name: formData.fullName,
        password: formData.password,
      });

      alert(response.data.message);
      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.detail || "Registration failed");
    }
  };

  const returnLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      {/* Background Blur */}
      <div className={styles.circleTop}></div>
      <div className={styles.circleBottom}></div>

      {/* LEFT SECTION */}
      <div className={styles.leftSection}>
        <p className={styles.welcome}>Welcome to</p>

        <img src={logo} alt="logo" className={styles.logo} />

        <p className={styles.description}>
          Insight your smart hub for turning student data into meaningful
          insights. Track performance, uncover trends, and group learners
          effectively all in one place.
        </p>
      </div>

      {/* REGISTER CARD */}
      <div className={styles.registerCard}>
        <h2>Register</h2>

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <img src={userIcon} alt="user" />
            <input
              type="text"
              name="fullName"
              placeholder="Instructor Full Name"
              onChange={handleChange}
            />
          </div>

          {/* Instructor ID */}
          <div className={styles.inputGroup}>
            <img src={idIcon} alt="id" />
            <input
              type="text"
              name="instructorId"
              placeholder="Instructor ID"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <img src={passIcon} alt="password" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <img src={passIcon} alt="confirm password" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          </div>

          <button className={styles.registerBtn}>Register User</button>
        </form>

        {/* Return to Login */}
        <div className={styles.returnLogin} onClick={returnLogin}>
          <img src={arrowIcon} alt="arrow" />
          <span>Return to Sign In</span>
        </div>
      </div>
    </div>
  );
};

export default Register;