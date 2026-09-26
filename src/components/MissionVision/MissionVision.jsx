import React from 'react';
import { Leaf } from 'lucide-react';
import Container from '../UI/Container/Container';
import GlowingEffect from '../ui/glowing-effect';
import './MissionVision.css';

const MissionVision = () => {
  return (
    <section className="why-mv-section">
      <Container>
        <div className="why-mv-grid">
          {/* Mission */}
          <div className="why-mv-card relative">
            <GlowingEffect
              blur={0}
              spread={40}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={3}
              glow={true}
              disabled={false}
            />
            <div className="relative z-10 flex gap-6 w-full h-full p-8">
              <div className="why-mv-icon-wrap">
                <Leaf size={28} className="why-mv-icon" />
              </div>
              <div className="why-mv-text-group">
                <span className="why-section-tag">OUR MISSION</span>
                <h3 className="why-mv-title">Making Natural Living More Accessible</h3>
                <p className="why-mv-desc">
                  Our mission is to make thoughtfully designed everyday products more accessible, combining carefully selected natural materials, timeless design, and a premium experience at prices that fit everyday homes.
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="why-mv-card relative">
            <GlowingEffect
              blur={0}
              spread={40}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={3}
              glow={true}
              disabled={false}
            />
            <div className="relative z-10 flex gap-6 w-full h-full p-8">
              <div className="why-mv-icon-wrap">
                <Leaf size={28} className="why-mv-icon" />
              </div>
              <div className="why-mv-text-group">
                <span className="why-section-tag">OUR VISION</span>
                <h3 className="why-mv-title">A Natural Choice for Every Home</h3>
                <p className="why-mv-desc">
                  Our vision is for thoughtfully made everyday essentials to become a natural choice for every home, combining quality, timeless design and carefully selected natural materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default MissionVision;
