import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck2,
  Users2,
  Globe2,
  Lock,
  Building2,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import styles from "./LandingPage.module.css";

const photoModules = import.meta.glob("./assets/photo/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", {
  eager: true,
  import: "default",
});

const SLIDES = Object.values(photoModules).map((src) => ({ src }));

const SLIDE_INTERVAL = 6000;

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Tamper-proof security",
    desc: "Every certificate is anchored to the blockchain, so it cannot be forged or altered.",
  },
  {
    icon: FileCheck2,
    title: "Instant verification",
    desc: "Employers and institutions confirm a credential in seconds with a unique QR code.",
  },
  {
    icon: Users2,
    title: "One national platform",
    desc: "Students, universities, MANEB and employers work from the same trusted record.",
  },
  {
    icon: Globe2,
    title: "Recognised abroad",
    desc: "Malawian qualifications can be checked and trusted across international borders.",
  },
];



const BENEFITS = [
  { icon: Lock, text: "Stop fraud before it happens" },
  { icon: Building2, text: "Protect institutional reputation" },
  { icon: GraduationCap, text: "Give graduates proof employers trust" },
];


export default function LandingPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const total = SLIDES.length;
  const goTo = useCallback((i) => setCurrent((i + total) % total), [total]);

  // Auto-advance
  useEffect(() => {
    if (paused || total < 2) return undefined;
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused, total]);

  // Solid navbar after scrolling past the top
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={`${styles.nav} ${scrolled ? styles.navSolid : ""}`}>
        <div className={styles.navInner}>
          <a href="#top" className={styles.brand}>
            
            <span className={styles.brandName}>Malawi CertSecure</span>
          </a>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#about" className={styles.navLink}>About</a>
            <button className={styles.navButton} onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero with sliding background */}
      <header
        id="top"
        className={styles.hero}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={styles.slides} aria-hidden="true">
          {SLIDES.map((s, i) => (
            <img
              key={s.src}
              src={s.src}
              alt=""
              className={`${styles.slide} ${i === current ? styles.slideActive : ""}`}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div className={styles.overlay} />
        </div>

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Certificates employers can trust, in seconds.
            </h1>
            <p className={styles.heroSubtitle}>
              Malawi CertSecure issues, manages and verifies academic credentials on
              the blockchain, so every qualification is authentic and permanent.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} onClick={() => navigate("/register")}>
                Create an account <ArrowRight size={18} />
              </button>
              <button className={styles.btnGlass} onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>

          <div className={styles.heroBottom}>

            {total > 1 && (
              <div className={styles.controls}>
                <button
                  className={styles.arrow}
                  onClick={() => goTo(current - 1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className={styles.dots}>
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.src}
                      className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                      onClick={() => goTo(i)}
                      aria-label={`Show image ${i + 1}`}
                      aria-current={i === current}
                    />
                  ))}
                </div>
                <button
                  className={styles.arrow}
                  onClick={() => goTo(current + 1)}
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built to restore trust in Malawian qualifications</h2>
            <p className={styles.sectionSubtitle}>
              Modern infrastructure that makes every certificate easy to check and impossible to fake.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <article key={f.title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <f.icon size={22} />
                </span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={`${styles.container} ${styles.about}`}>
          <div className={styles.aboutText}>
            <h2 className={styles.sectionTitle}>The problem with paper certificates</h2>
            <p className={styles.aboutDesc}>
              Fake certificates have damaged Malawi's education system and economy.
              Unqualified people in critical roles lead to poor service delivery and
              less trust in our institutions.
            </p>
            <p className={styles.aboutDesc}>
              CertSecure anchors every academic record to the blockchain, so each
              credential stays authentic, permanent and verifiable anywhere.
            </p>
            <ul className={styles.benefits}>
              {BENEFITS.map((b) => (
                <li key={b.text} className={styles.benefit}>
                  <b.icon size={18} className={styles.benefitIcon} />
                  {b.text}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.seal}>
            <div className={styles.sealInner}>
              <ShieldCheck size={44} className={styles.sealIcon} />
              <strong className={styles.sealTitle}>Verified on the blockchain</strong>
              <span className={styles.sealText}>Issued by an accredited institution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to join the network?</h2>
          <p className={styles.ctaSubtitle}>
            Students, universities and employers can create an account in minutes.
          </p>
          <button className={styles.btnLight} onClick={() => navigate("/register")}>
            Register now <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerBrand}>
            <div className={styles.brand}>
              
              <span className={styles.brandNameDark}>Malawi CertSecure</span>
            </div>
            <p className={styles.footerDesc}>
              The official blockchain-backed platform for secure academic credentials in Malawi.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Platform</h4>
            <a href="#features" className={styles.footerLink}>Features</a>
            <a href="#about" className={styles.footerLink}>About</a>
            <button className={styles.footerLink} onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Contact NCHE</h4>
            <span className={styles.contactItem}><MapPin size={16} /> Lilongwe, Malawi</span>
            <span className={styles.contactItem}><Mail size={16} /> info@nche.ac.mw</span>
            <span className={styles.contactItem}><Phone size={16} /> +265 1 755 400</span>
          </div>
        </div>

        <div className={`${styles.container} ${styles.footerBottom}`}>
          © {new Date().getFullYear()} National Council for Higher Education (NCHE). All rights reserved.
        </div>
      </footer>
    </div>
  );
}