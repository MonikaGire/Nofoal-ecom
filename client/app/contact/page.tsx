import type { Metadata } from 'next';
import ClientModals from '@/components/ClientModals';

export const metadata: Metadata = { title: 'Nofoal | Contact' };

export default function ContactPage() {
  return (
    <>
      <style>{`
        body {
          background: #000;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 80px 20px 140px;
          overflow-x: hidden;
        }

        .contact-container {
          text-align: center;
          z-index: 2;
          position: relative;
        }

        .contact-email a {
          color: #ffffff;
          font-size: clamp(11px, 3vw, 14px);
          text-decoration: none;
          letter-spacing: clamp(1px, 0.5vw, 2px);
          text-transform: uppercase;
          font-weight: 300;
          transition: all 0.3s ease;
          word-break: break-all;
        }

        .contact-email a:hover { opacity: 0.7; }

        .contact-email a::after {
          content: "_";
          opacity: 0;
          animation: cursor 1s infinite;
        }

        @keyframes cursor {
          0%, 40% { opacity: 0; }
          50%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (max-width: 480px) {
          body { padding: 80px 16px 120px; }
        }
      `}</style>

      {/* Contact Content */}
      <div className="contact-container">
        <div className="contact-email">
          <a href="mailto:Slidein@Nofoal.com">SLIDEIN@NOFOAL.COM</a>
        </div>
      </div>

      <ClientModals />
    </>
  );
}
