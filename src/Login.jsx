import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './autho.module.css';
import { ArrowRight } from 'lucide-react';

// Import local images
import graduationImg from './assets/photo/Graduation.jpg';
import gala4Img from './assets/photo/gala4.jpg';
import gala8Img from './assets/photo/gala8.jpg';

// Import icons
import { Shield, Lock, Users, CheckCircle, Globe, BookOpen, Heart, Award, GraduationCap, AlertTriangle, TrendingDown, Building, Briefcase, DollarSign, UserX } from 'lucide-react';

function Auth() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Slideshow images - Local Malawian graduation images
  const slideImages = [
    {
      url: graduationImg,
      title: 'Celebrating Malawian Excellence',
      subtitle: 'Empowering Malawian graduates with secure digital certificates'
    },
    {
      url: gala4Img,
      title: 'Academic Achievement',
      subtitle: 'Building the future of education in Malawi'
    },
    {
      url: gala8Img,
      title: 'Graduation Success',
      subtitle: 'Recognizing the success of Malawian students'
    }
  ];

  // Slideshow auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slideImages.length]);

  const handleGetStarted = () => {
    navigate('/login'); // Navigate to login form page
  };

  return (
    <div className={styles.authPage}>
      {/* Top Navigation Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.logo}>
            <div className={styles.logoContainer}>
              <div className={styles.malawiFlag}>
                <div className={styles.flagStripe} style={{ backgroundColor: '#000000' }}></div>
                <div className={styles.flagStripe} style={{ backgroundColor: '#CE1126' }}></div>
                <div className={styles.flagStripe} style={{ backgroundColor: '#00A651' }}></div>
              </div>
              <h2 className={styles.logoText}>Malawi CertSecure</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Left Side - Slideshow */}
        <div className={styles.slideshowContainer}>
          <div className={styles.slideshow}>
            {slideImages.map((slide, index) => (
              <div
                key={index}
                className={styles.slide + (index === currentSlide ? ' ' + styles.slideActive : '')}
                style={{ backgroundImage: "url(" + slide.url + ")" }}
              >
                <div className={styles.slideOverlay}>
                  <div className={styles.slideContent}>
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <div className={styles.slideActions}>
                      <button
                        type="button"
                        className={styles.heroGetStartedBtn}
                        onClick={handleGetStarted}
                      >
                        <span>Get Started</span>
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className={styles.slideIndicators}>
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  className={styles.indicator + (index === currentSlide ? ' ' + styles.indicatorActive : '')}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          {/* Inspirational Message */}
          <div className={styles.messageSection}>
            <div className={styles.messageContent}>
              <h3>🤝 Let's Secure Our Certificates by Joining Hands Together</h3>
              <p>Let's improve education in Malawi through secure certificate verification system. Together, we can build trust, prevent fraud, and enhance the value of Malawian education credentials.</p>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔒</span>
                  <span>Secure & Tamper-Proof</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>⚡</span>
                  <span>Instant Verification</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🌍</span>
                  <span>Globally Recognized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informational Cards Section */}
      <div className={styles.infoCardsSection}>
        <div className={styles.infoCardsContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why CertSecure Malawi Matters</h2>
            <p className={styles.sectionSubtitle}>
              Building a secure and unified future for Malawian education
            </p>
          </div>

          <div className={styles.cardsGrid}>
            {/* Certificate Security Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Shield size={32} />
                </div>
                <h3 className={styles.cardTitle}>Secure Your Certificates</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  In today's digital world, certificate fraud is a growing concern. Our certificate secure
                  system ensures your academic achievements are tamper-proof and instantly verifiable.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <Lock size={16} />
                    <span>Advanced Protection</span>
                  </div>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>Instant Verification</span>
                  </div>
                  <div className={styles.feature}>
                    <Globe size={16} />
                    <span>Global Recognition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unity and Collaboration Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Users size={32} />
                </div>
                <h3 className={styles.cardTitle}>Unity in Education</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  Together, we're building a stronger educational ecosystem in Malawi. When institutions,
                  students, and employers unite, we create opportunities for growth and development.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <Heart size={16} />
                    <span>Collaborative Growth</span>
                  </div>
                  <div className={styles.feature}>
                    <BookOpen size={16} />
                    <span>Knowledge Sharing</span>
                  </div>
                  <div className={styles.feature}>
                    <Award size={16} />
                    <span>Mutual Recognition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Future of Education Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <GraduationCap size={32} />
                </div>
                <h3 className={styles.cardTitle}>Future-Ready Education</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  Embrace the digital transformation of education in Malawi. Our platform prepares
                  students and institutions for the global digital economy.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <Globe size={16} />
                    <span>Digital Innovation</span>
                  </div>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>Quality Assurance</span>
                  </div>
                  <div className={styles.feature}>
                    <Award size={16} />
                    <span>Excellence Standards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact of Fake Certificates Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' }}>
                  <AlertTriangle size={32} />
                </div>
                <h3 className={styles.cardTitle}>Impact of Fake Certificates in Malawi</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  Fake certificates have significantly undermined Malawi's education system and economy.
                  Unqualified individuals in critical positions have led to poor service delivery and
                  reduced trust in our educational institutions.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <TrendingDown size={16} />
                    <span>Reduced Education Quality</span>
                  </div>
                  <div className={styles.feature}>
                    <UserX size={16} />
                    <span>Unqualified Professionals</span>
                  </div>
                  <div className={styles.feature}>
                    <Building size={16} />
                    <span>Institutional Mistrust</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Economic Impact Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}>
                  <DollarSign size={32} />
                </div>
                <h3 className={styles.cardTitle}>Economic Consequences</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  The prevalence of fake certificates has cost Malawi millions in lost productivity,
                  failed projects, and damaged international reputation. Employers struggle to find
                  genuinely qualified candidates.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <TrendingDown size={16} />
                    <span>Lost Productivity</span>
                  </div>
                  <div className={styles.feature}>
                    <Briefcase size={16} />
                    <span>Employment Challenges</span>
                  </div>
                  <div className={styles.feature}>
                    <Globe size={16} />
                    <span>International Reputation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Through Technology Card */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 className={styles.cardTitle}>Our Solution for Malawi</h3>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.cardDescription}>
                  CertSecure Malawi provides a comprehensive solution to combat certificate fraud
                  through advanced certificate secure technology, ensuring every certificate is authentic and
                  instantly verifiable by employers worldwide.
                </p>
                <div className={styles.cardFeatures}>
                  <div className={styles.feature}>
                    <Shield size={16} />
                    <span>100% Fraud Prevention</span>
                  </div>
                  <div className={styles.feature}>
                    <CheckCircle size={16} />
                    <span>Instant Verification</span>
                  </div>
                  <div className={styles.feature}>
                    <Award size={16} />
                    <span>Restored Trust</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;