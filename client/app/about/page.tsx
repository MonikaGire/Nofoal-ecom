import type { Metadata } from 'next';
import ClientModals from '@/components/ClientModals';

export const metadata: Metadata = { title: 'Nofoal | Bio' };

export default function AboutPage() {
  return (
    <>
      <style>{`
        body {
          background: #000;
          color: #fff;
          min-height: 100vh;
          margin: 0;
          padding: 80px 20px 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .center-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 700px;
        }

        .polaroid-stack { position: relative; display: inline-block; }

        .polaroid-card { background: #fff; position: relative; }

        .polaroid-top {
          width: min(360px, 88vw);
          height: clamp(260px, 50vw, 380px);
          padding: 2px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrapper { width: 100%; height: 100%; overflow: hidden; }

        .center-image { width: 100%; height: 100%; object-fit: cover; display: block; }

        .polaroid-bottom {
          width: min(360px, 88vw);
          min-height: clamp(180px, 30vw, 300px);
          margin-top: 10px;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 40px 100%, 0 calc(100% - 40px));
        }

        .note-text {
          font-size: clamp(11px, 2vw, 13px);
          color: #1a1a1a;
          letter-spacing: 0.5px;
          text-align: left;
          line-height: 1.7;
          padding: clamp(20px, 5vw, 40px) clamp(16px, 4vw, 35px);
        }

        .paperclip {
          position: absolute;
          top: clamp(220px, 45vw, 300px);
          right: clamp(20px, 5vw, 50px);
          z-index: 3;
          width: clamp(50px, 10vw, 80px);
          height: clamp(80px, 16vw, 120px);
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
          transform: rotate(-8deg);
          object-fit: contain;
        }

        @media (max-width: 480px) {
          body { padding: 70px 12px 120px; }
          .center-content { align-items: flex-start; padding-top: 0; }
        }
      `}</style>

      {/* Polaroid Layout */}
      <div className="center-content">
        <div className="polaroid-stack">
          <div className="polaroid-card polaroid-top">
            <div className="image-wrapper">
              <img src="/asset/images/about.jpeg" alt="Portrait" className="center-image" />
            </div>
          </div>

        </div>
      </div>

      <ClientModals />
    </>
  );
}
