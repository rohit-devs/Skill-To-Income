import React from 'react';
import { Link } from 'react-router-dom';

const pillars = [
  'Visual systems that feel premium and trustworthy',
  'Motion and interaction design with clear hierarchy',
  'Conversion-focused layouts for product and landing pages',
  'Accessible UI patterns tuned for modern SaaS products',
];

const highlights = [
  { label: 'UI Strategy', value: '12+ years' },
  { label: 'Launches', value: '40+' },
  { label: 'Satisfaction', value: '98%' },
];

export default function PremiumDesignSection() {
  return (
    <section id="design-expertise" style={{ position: 'relative', zIndex: 1, padding: '24px 24px 100px' }}>
      <div className="premium-design-shell">
        <div className="premium-design-grid">
          <div className="premium-design-copy">
            <div className="premium-badge">Premium UI Design Expertise</div>
            <h2>Crafting elegant, conversion-first experiences that feel unmistakably premium.</h2>
            <p>
              Every detail is shaped to feel refined — from typography and spacing to motion and feedback — so your product feels polished, credible, and ready to scale.
            </p>

            <div className="premium-list">
              {pillars.map((item) => (
                <div key={item} className="premium-pill">
                  <span className="material-symbols-outlined icon-fill">auto_awesome</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="premium-actions">
              <Link to="/pricing" className="premium-cta">Explore Premium Plans</Link>
              <a href="#features" className="premium-link">See platform features</a>
            </div>
          </div>

          <div className="premium-design-visual">
            <div className="premium-card premium-card-hero">
              <div className="premium-card-top">
                <span className="premium-card-label">Design system</span>
                <span className="premium-card-status">Live</span>
              </div>
              <div className="premium-metric">94%</div>
              <p>Visual clarity score across first-run experiences and onboarding flows.</p>
              <div className="premium-steps">
                <span>Typography</span>
                <span>Motion</span>
                <span>Spacing</span>
                <span>Accessibility</span>
              </div>
            </div>

            <div className="premium-card premium-card-stack">
              {highlights.map((item) => (
                <div key={item.label} className="premium-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="premium-card premium-card-mini">
              <span className="material-symbols-outlined icon-fill">palette</span>
              <div>
                <h3>Brand-ready UI kits</h3>
                <p>Flexible component systems for startups, SaaS, and premium marketplaces.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
