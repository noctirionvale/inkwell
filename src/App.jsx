import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LangProvider, useLang } from './hooks/useLang';
import Navbar from './components/Navbar';
import StoryCarousel from './components/StoryCarousel';
import GenreStrip from './components/GenreStrip';
import TonightsPick from './components/TonightsPick';
import UpcomingStories from './components/UpcomingStories';
import StorySubmitForm from './components/StorySubmitForm';
import LouisesCorner from './components/LouisesCorner';
import ReadingList from './pages/ReadingList';
import StoryDetail from './pages/StoryDetail';
import ContinueReading from './components/ContinueReading';
import Profile from './pages/Profile';

import './styles/global.css';
import './styles/navbar.css';
import './styles/tonightspick.css';
import './styles/carousel.css';
import './styles/auth.css';
import './styles/genre.css';
import './styles/submit.css';
import './styles/readinglist.css';
import './styles/modal.css';
import './styles/upcoming.css';
import './styles/profile.css';

function HomePage() {
  const { t } = useLang();
  const [showSubmit, setShowSubmit] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#louises-corner') {
      const el = document.getElementById('louises-corner');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <>
      <header className="hero-header">
        <p className="hero-eyebrow">{t.hero_eyebrow}</p>
        <h1 className="hero-title">{t.hero_title}</h1>
        <p className="hero-sub">
          {t.hero_sub.split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </p>
      </header>

      <StoryCarousel />
      <ContinueReading />

      <div className="carousel-footer">
        <UpcomingStories />
        <GenreStrip />
        <TonightsPick />
      </div>


      <section className="submit-cta-section">
        <div className="submit-cta-inner">
          <p className="submit-cta-eyebrow">✦ Open Submissions</p>
          <h2 className="submit-cta-title">Have a story that lingers?</h2>
          <p className="submit-cta-sub">We accept short stories, flash fiction, and poetry in English, Filipino, and Chinese.</p>
          <button className="submit-cta-btn" onClick={() => setShowSubmit(true)}>
            {t.submit_story} →
          </button>
        </div>
      </section>

      <div className="site-footer">
  <div className="footer-links-right">
    <a href="https://noctirionvaleport.vercel.app/" target="_blank" rel="noopener noreferrer" className="social-link">🌐 Portfolio</a>
    <a href="https://x.com/NoctirionV42607" target="_blank" rel="noopener noreferrer" className="social-link">🐦 X (Twitter)</a>
  </div>
</div>

      {showSubmit && <StorySubmitForm onClose={() => setShowSubmit(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reading-list" element={<ReadingList />} />
              <Route path="/story/:id" element={<StoryDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </LangProvider>
    </AuthProvider>
  );
}