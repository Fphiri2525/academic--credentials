import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, X } from 'lucide-react';
import styles from './student.module.css';

const StudentTopBar = ({ onReset, showResetButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Background slideshow images (same as main Student page)
  const slideImages = [
    {
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'Academic Excellence',
      subtitle: 'Secure your achievements with blockchain technology'
    },
    {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'Digital Certificates',
      subtitle: 'Tamper-proof verification for your credentials'
    },
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'Trusted Verification',
      subtitle: 'Your achievements, secured and verified for life'
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Background Slideshow */}
      <div className={styles.backgroundSlideshow}>
        {slideImages.map((slide, index) => (
          <div
            key={index}
            className={`${styles.backgroundSlide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <GraduationCap className={styles.logoIcon} />
            <h1 className={styles.title}>Student Digital Certificate Portal</h1>
          </div>

          {/* Reset/Clear Button */}
          {showResetButton && onReset && (
            <button
              onClick={onReset}
              className={styles.cancelButton}
              title="Clear everything and start over"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </header>
    </>
  );
};

export default StudentTopBar;
