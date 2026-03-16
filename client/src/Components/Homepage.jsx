import React, { useState } from 'react'
import styles from './Homepage.module.css'
import logoVideo from '../assets/Logo.mp4'
import { useNavigate } from 'react-router-dom'

function Homepage() {

  const [showText, setShowText] = useState(false);
  const navigate = useNavigate();

  const handleVideoEnd = () => {
    setShowText(true);
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className={styles.background}>

        <div className={`${styles.circle} ${styles.circleTop}`}></div>
        <div className={`${styles.circle} ${styles.circleBottom}`}></div>

        <div className={styles.logoContainer}>
          <video
            className={styles.logoVideo}
            src={logoVideo}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          />
        </div>

        {showText && (
          <div className={styles.message}>
            Insight your smart hub for turning student data into meaningful insights.
            Track performance, uncover trends, and group learners effectively all in one place.
            <br/><br/>
            Data shouldn’t be complicated. Insight simplifies student analytics so educators 
            can focus on what matters most helping students succeed. Transform raw academic 
            data into clear visual insights in seconds. Spend less time analyzing numbers 
            and more time empowering students.
          </div>
        )}

      </section>

      <div className={styles.divider}></div>
      
      <section className={styles.cardsSection}>

        <div className={styles.card}>
          <h3>Features</h3>
          <p>
            Insight is built to simplify how educators interact with student data.
            The platform provides powerful yet easy-to-use tools that transform
            complex information into meaningful insights.
          </p>
        </div>

        <div className={styles.card}>
          <h3>Analytics</h3>
          <p>
            Insight’s analytics tools turn raw academic data into clear visual
            insights. Through interactive charts and performance summaries,
            educators can easily track progress and identify trends.
          </p>
        </div>

        <div className={styles.card}>
          <h3>About Us</h3>
          <p>
            Insight is a smart platform designed to help educators transform
            student data into meaningful insights, helping institutions better
            understand learning patterns and academic performance.
          </p>
        </div>

      </section>

      {/* CTA BUTTON */}
      <div className={styles.ctaContainer}>
        <button
          className={styles.ctaButton}
          onClick={() => navigate('/login')}
        >
          Explore Insight →
        </button>
      </div>

    </>
  );
}

export default Homepage