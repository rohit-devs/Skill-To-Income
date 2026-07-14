// ----------------------------------------------------------------------
// File: client/src/components/features/PremiumDesignSection.js
// Purpose: First-party module for the Skill-To-Income application.
// Author: Principal Software Architect
// Dependencies: react, feature data, shared UI.
// Used By: React client application.
// Features: Production-ready marketplace, dashboard, auth, and workflow behavior.
// Responsibilities: Keep this module focused, maintainable, and aligned with app architecture.
// ----------------------------------------------------------------------

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Hyperspeed } from '../ui';

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
  const hyperspeedOptions = useMemo(() => ({
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131320,
      brokenLines: 0x131320,
      leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
      rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
      sticks: 0x03B3C3,
    },
  }), []);

  return (
    <section id="design-expertise" style={{ position: 'relative', zIndex: 1, padding: '24px 24px 100px', overflow: 'hidden' }}>
      {/* Hyperspeed WebGL background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.55, pointerEvents: 'none' }}>
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>
      <div className="premium-design-shell" style={{ position: 'relative', zIndex: 1 }}>
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
