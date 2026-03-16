import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import userIcon from "../assets/user.png";
import passIcon from "../assets/passkey.png";
import logo from "../assets/Logoo.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    instructorId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.instructorId || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await loginUser({
        instructor_id: formData.instructorId,
        password: formData.password,
      });

      const token = response.data.access_token;

      localStorage.setItem("token", token);

      alert("Login successful");

      navigate("/dashboard");

    } catch (error) {
      alert(error.response?.data?.detail || "Login failed");
    }
  };

  const goRegister = () => {
    navigate("/register");
  };

  return (
    <div className={styles.container}>
      {/* Background Blur Circles */}
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

      {/* LOGIN CARD */}
      <div className={styles.loginCard}>
        <h2>Insight Login</h2>

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <img src={userIcon} alt="" />
            <input
              type="text"
              name="instructorId"
              placeholder="Instructor ID"
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <img src={passIcon} alt="" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button className={styles.loginBtn}>Login</button>
        </form>

        <p className={styles.registerText}>
          New to Insight? <span onClick={goRegister}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
