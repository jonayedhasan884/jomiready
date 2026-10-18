
import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Files,
  Menu,
  ShieldCheck,
  Calculator,
  ClipboardCheck,
  Landmark,
  X,
  MapPin,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Verification from './pages/Verification.jsx'
const services = [
  {
    icon: FileSearch,
    number: '০১',
    title: 'ভূমি রেকর্ড যাচাই',
    description:
      'খতিয়ান, দাগ নম্বর ও জমির তথ্যের মধ্যে সম্ভাব্য অসংগতি শনাক্ত করতে সাহায্য করুন।',
    link: '#verify',
  },
  {
    icon: Files,
    number: '০২',
    title: 'পুরোনো রেকর্ডের মিল',
    description:
      'CS, SA, RS ও BS রেকর্ডের মধ্যে সম্ভাব্য মিল এবং অনিশ্চিত তথ্য পর্যালোচনা করুন।',
    link: '#verify',
  },
  {
    icon: Calculator,
    number: '০৩',
    title: 'জমির অংশের হিসাব',
    description:
      'প্রদত্ত তথ্যের ভিত্তিতে জমির অংশ, বিক্রির পরিমাণ ও অবশিষ্ট জমির হিসাব করুন।',
    link: '#verify',
  },
  {
    icon: ClipboardCheck,
    number: '০৪',
    title: 'যাচাই প্রস্তুতি প্রতিবেদন',
    description:
      'কোন তথ্য যাচাই করা হয়েছে, কী অসংগতি আছে এবং পরবর্তী পদক্ষেপ কী—জেনে নিন।',
    link: '#verify',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem('jomiReadyCurrentPage')
    return savedPage || 'home'
  })
  
  useEffect(() => {
    sessionStorage.setItem('jomiReadyCurrentPage', currentPage)
  }, [currentPage])

  const closeMenu = () => setMenuOpen(false)
  if (currentPage === 'login') {
    return (
      <Login
        onLogin={() => setCurrentPage('dashboard')}
        onBack={() => setCurrentPage('home')}
      />
    )
  }
  
  if (currentPage === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => setCurrentPage('login')}
      />
    )
  }
  if (currentPage === 'verification') {
    return (
      <Verification
        onBack={() => setCurrentPage('home')}
      />
    )
  }

  return (
    <div className="site-shell">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>
            <MapPin size={14} />
            বাংলাদেশের ভূমি তথ্য যাচাইয়ের প্রস্তুতিতে আপনার সহায়ক
          </span>
          <span className="top-note">
            <ShieldCheck size={14} />
            সচেতন সিদ্ধান্ত, নিরাপদ পদক্ষেপ
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="container navbar">
          <a href="#home" className="brand" onClick={closeMenu}>
            <span className="brand-mark">
              <Landmark size={25} strokeWidth={1.8} />
            </span>
            <span className="brand-copy">
              <strong>JomiReady</strong>
              <small>ডিজিটাল ভূমি যাচাই সহায়ক</small>
            </span>
          </a>

          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
            <a href="#home" onClick={closeMenu}>হোম</a>
            <a href="#services" onClick={closeMenu}>আমাদের সেবা</a>
            <a href="#how-it-works" onClick={closeMenu}>যেভাবে কাজ করে</a>
            <a href="#about" onClick={closeMenu}>আমাদের সম্পর্কে</a>
            <a href="#verify" className="nav-cta" onClick={closeMenu}>
              যাচাই শুরু করুন <ArrowRight size={16} />
            </a>
            <button
           type="button"
             className="staff-login-button"
              onClick={() => {
                  closeMenu()
                 setCurrentPage('login')
                   }}
                      >
                  স্টাফ লগইন
                    <ArrowRight size={16} />
                      </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-decoration decoration-one" />
          <div className="hero-decoration decoration-two" />

          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow">
                <Sparkles size={15} />
                <span>ভূমি তথ্য যাচাইয়ের নতুন অভিজ্ঞতা</span>
              </div>

              <h1>
                জমি কেনার আগে,
                <br />
                <span>তথ্য যাচাই করুন।</span>
              </h1>

              <p className="hero-description">
                জমির রেকর্ড, দাগ নম্বর, জমির পরিমাণ ও সম্ভাব্য অসংগতি
                সম্পর্কে প্রাথমিক ধারণা নিন। প্রয়োজনীয় তথ্য যাচাই করে
                সচেতন সিদ্ধান্তের দিকে এগিয়ে যান।
              </p>

              <div className="hero-actions">
                <a href="#verify" className="button button-primary">
                  <FileSearch size={18} />
                  জমির তথ্য যাচাই করুন
                  <ArrowRight size={17} />
                </a>
                <a href="#how-it-works" className="button button-secondary">
                  কীভাবে কাজ করে?
                </a>
              </div>

              <div className="hero-trust">
                <span><CheckCircle2 size={16} /> সহজবোধ্য প্রতিবেদন</span>
                <span><CheckCircle2 size={16} /> সম্ভাব্য অসংগতি শনাক্ত</span>
                <span><CheckCircle2 size={16} /> বাংলা ভাষায় নির্দেশনা</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="land-illustration">
                <div className="illustration-top">
                  <span className="mini-brand">
                    <Landmark size={16} /> ভূমি তথ্য
                  </span>
                  <span className="demo-badge">নমুনা</span>
                </div>

                <div className="map-art">
                  <div className="map-grid" />
                  <svg
                    className="parcel-map"
                    viewBox="0 0 440 300"
                    role="img"
                    aria-label="জমির দাগের কাল্পনিক নকশা"
                  >
                    <path
                      d="M44 49 L177 29 L205 101 L128 147 L45 117 Z"
                      fill="#d9eee0"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M177 29 L310 48 L328 122 L205 101 Z"
                      fill="#b6ddc5"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M310 48 L397 78 L380 164 L328 122 Z"
                      fill="#e5f0dc"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M45 117 L128 147 L115 249 L40 221 Z"
                      fill="#e5f0dc"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M128 147 L205 101 L250 178 L183 237 L115 249 Z"
                      fill="#70b991"
                      stroke="#287d55"
                      strokeWidth="3"
                    />
                    <path
                      d="M205 101 L328 122 L344 220 L250 178 Z"
                      fill="#d9eee0"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M328 122 L380 164 L367 257 L344 220 Z"
                      fill="#c5e4ce"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M40 221 L115 249 L183 237 L250 178 L344 220 L367 257 L210 276 L62 266 Z"
                      fill="#eaf3e9"
                      stroke="#6ca58a"
                      strokeWidth="2"
                    />
                    <path
                      d="M128 147 L205 101 L250 178 L183 237 L115 249 Z"
                      fill="none"
                      stroke="#176b49"
                      strokeWidth="2"
                      strokeDasharray="6 5"
                    />
                    <g fill="#245d43" fontSize="13" fontWeight="600">
                      <text x="91" y="87">১০১</text>
                      <text x="244" y="71">১০২</text>
                      <text x="351" y="111">১০৩</text>
                      <text x="66" y="189">১০৪</text>
                      <text x="167" y="176" fill="#fff">১০৫</text>
                      <text x="278" y="150">১০৬</text>
                      <text x="310" y="239">১০৭</text>
                    </g>
                  </svg>

                  <div className="map-pin">
                    <MapPin size={17} />
                    <span>নির্বাচিত দাগ</span>
                  </div>
                </div>

                <div className="illustration-footer">
                  <div>
                    <small>মৌজা কোড</small>
                    <strong>MOUZA-001</strong>
                  </div>
                  <div>
                    <small>রেকর্ড অবস্থা</small>
                    <strong className="status-text">
                      <span /> প্রাথমিক পর্যালোচনা
                    </strong>
                  </div>
                </div>
              </div>

              <div className="floating-card floating-card-top">
                <span className="floating-icon"><ShieldCheck size={19} /></span>
                <span>
                  <strong>তথ্যভিত্তিক যাচাই</strong>
                  <small>প্রতিটি ফলাফলের ব্যাখ্যা</small>
                </span>
              </div>

              <div className="floating-card floating-card-bottom">
                <span className="floating-icon floating-icon-light">
                  <FileSearch size={19} />
                </span>
                <span>
                  <strong>সহজ প্রতিবেদন</strong>
                  <small>পরবর্তী পদক্ষেপ জানুন</small>
                </span>
              </div>
            </div>
          </div>

          <div className="container hero-bottom">
            <a href="#services" className="scroll-cue">
              <span className="scroll-icon"><ArrowDown size={15} /></span>
              <span>আমাদের সেবাগুলো দেখুন</span>
            </a>
            <span className="hero-bottom-note">
              আপনার যাচাইয়ের প্রস্তুতি শুরু হোক সঠিক তথ্য দিয়ে।
            </span>
          </div>
        </section>

        <section className="services-section section-padding" id="services">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                আমাদের সেবাসমূহ
              </div>
              <h2>জমির তথ্য বুঝুন, <span>সিদ্ধান্ত নিন সচেতনভাবে।</span></h2>
              <p>
                জমির তথ্য পর্যালোচনা থেকে শুরু করে যাচাইয়ের প্রস্তুতি—
                প্রয়োজনীয় বিষয়গুলো এক জায়গায়।
              </p>
            </div>

            <div className="services-grid">
              {services.map((service) => {
                const Icon = service.icon

                return (
                  <article className="service-card" key={service.number}>
                    <div className="service-card-top">
                      <span className="service-icon"><Icon size={23} /></span>
                      <span className="service-number">{service.number}</span>
                    </div>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <a href={service.link} className="service-link">
                      বিস্তারিত দেখুন <ArrowRight size={16} />
                    </a>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="process-section section-padding" id="how-it-works">
          <div className="container process-grid">
            <div className="process-intro">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                কাজ করার পদ্ধতি
              </div>
              <h2>মাত্র তিন ধাপে <span>যাচাইয়ের প্রস্তুতি।</span></h2>
              <p>
                সহজ ধাপে তথ্য দিন, সম্ভাব্য অসংগতি বুঝুন এবং প্রয়োজনীয়
                কাগজপত্র আরও ভালোভাবে যাচাই করার প্রস্তুতি নিন।
              </p>
              <a href="#verify" className="text-link">
                এখনই শুরু করুন <ArrowRight size={17} />
              </a>
            </div>

            <div className="process-list">
              <div className="process-item">
                <div className="process-step">০১</div>
                <div>
                  <h3>জমির তথ্য প্রদান করুন</h3>
                  <p>প্রয়োজনীয় দাগ, রেকর্ড ও জমির পরিমাণের তথ্য দিন।</p>
                </div>
                <ChevronRight className="process-arrow" size={21} />
              </div>
              <div className="process-item">
                <div className="process-step">০২</div>
                <div>
                  <h3>সম্ভাব্য অসংগতি দেখুন</h3>
                  <p>তথ্যের মিল, অমিল এবং যেসব বিষয়ে পর্যালোচনা দরকার তা দেখুন।</p>
                </div>
                <ChevronRight className="process-arrow" size={21} />
              </div>
              <div className="process-item">
                <div className="process-step">০৩</div>
                <div>
                  <h3>প্রতিবেদন ও পরবর্তী পদক্ষেপ</h3>
                  <p>কোন তথ্য বা কাগজপত্র আরও যাচাই করতে হবে তা জানুন।</p>
                </div>
                <ChevronRight className="process-arrow" size={21} />
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" id="verify">
          <div className="container">
            <div className="cta-card">
              <div className="cta-decoration" />
              <div className="cta-content">
                <span className="cta-label">
                  <Search size={15} /> আপনার যাচাই শুরু হোক
                </span>
                <h2>জমির তথ্য যাচাইয়ের জন্য প্রস্তুত?</h2>
                <p>
                  পরবর্তী ধাপে আমরা আপনার জন্য একটি সহজ বাংলা
                  যাচাই ফর্ম তৈরি করব।
                </p>
                <button
                      className="button button-white"
                         onClick={() => setCurrentPage('verification')}
                                >
                      যাচাই শুরু করুন <ArrowRight size={17} />
                </button>
              </div>
              <div className="cta-icon">
                <ClipboardCheck size={72} strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </section>

        <section className="about-section section-padding" id="about">
          <div className="container about-grid">
            <div className="about-icon">
              <Landmark size={38} />
            </div>
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                JomiReady সম্পর্কে
              </div>
              <h2>ভূমি তথ্য যাচাইয়ের প্রস্তুতিতে <span>একটি সহায়ক উদ্যোগ।</span></h2>
              <p>
                JomiReady একটি প্রোটোটাইপ, যা জমির রেকর্ডের সম্ভাব্য
                অসংগতি বুঝতে এবং প্রয়োজনীয় তথ্য যাচাইয়ের প্রস্তুতি নিতে
                সাহায্য করার জন্য তৈরি হচ্ছে।
              </p>
              <p className="disclaimer">
                <ShieldCheck size={17} />
                JomiReady সরকারি সেবা নয় এবং মালিকানা, দলিলের বৈধতা
                বা জমির আইনগত অবস্থার চূড়ান্ত নিশ্চয়তা দেয় না।
                গুরুত্বপূর্ণ সিদ্ধান্তের আগে সংশ্লিষ্ট সরকারি নথি ও
                যোগ্য পেশাজীবীর মাধ্যমে যাচাই করুন।
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <a href="#home" className="brand footer-brand">
            <span className="brand-mark">
              <Landmark size={24} />
            </span>
            <span className="brand-copy">
              <strong>JomiReady</strong>
              <small>ডিজিটাল ভূমি যাচাই সহায়ক</small>
            </span>
          </a>

          <p>সচেতন সিদ্ধান্তের জন্য তথ্যভিত্তিক প্রস্তুতি।</p>

          <a href="#home" className="back-top">
            উপরে ফিরে যান <ArrowRight size={15} />
          </a>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} JomiReady · শিক্ষামূলক প্রোটোটাইপ</span>
          <span>নমুনা তথ্য ব্যবহার করুন, ব্যক্তিগত জমির নথি নয়।</span>
        </div>
      </footer>
    </div>
  )
}

export default App

