import type { Metadata } from 'next';
import type { Product } from '@/types';
import ClientModals from '@/components/ClientModals';
import ProductsGrid from './ProductsGrid';

export const metadata: Metadata = {
  title: 'Nofoal | OBJECTS',
};

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  // Slug-to-cover-image mapping (fallback if DB not seeded yet)
  const fallbackOrder = [
    { slug: 'trolly-bag', title: 'Rigid Transit 20', coverImage: '/asset/images/products/cover-products/trolly-bag.jpg' },
    { slug: 'umbrella', title: 'Weather Module', coverImage: '/asset/images/products/cover-products/umbrella.jpeg' },
    { slug: 'water-bottle-s', title: 'Utility Flask 560', coverImage: '/asset/images/products/cover-products/bottle-s.jpeg' },
    { slug: 'sunglass', title: 'Field Frame', coverImage: '/asset/images/products/cover-products/sunglass.jpeg' },
    { slug: 'side-bag', title: 'Structure Sling', coverImage: '/asset/images/products/cover-products/side-bag.jpg' },
    { slug: 'water-bottle-b', title: 'Utility Flask 1500', coverImage: '/asset/images/products/cover-products/bottle-b.jpeg' },
    { slug: 'bag-pack', title: 'Core Pack', coverImage: '/asset/images/products/cover-products/bag-pack.jpg' },
    { slug: 'trolly-bag-pro', title: 'Rigid Transit 27', coverImage: '/asset/images/products/cover-products/trolly-bag-pro.jpg' },
    { slug: 'go-pro', title: 'Field Case', coverImage: '/asset/images/products/cover-products/go-pro.jpg' },
  ];

  const displayProducts = products.length > 0 ? products : fallbackOrder;

  return (
    <>
      <style>{`
        :root {
          --primary-bg: #f5f4f0;
          --text-dark: #1a1a1a;
          --accent-yellow: #fff;
          --accent-orange: #000000;
          --card-bg: #ffffff;
        }

        body {
          background-color: var(--primary-bg);
          color: var(--text-dark);
          -webkit-font-smoothing: antialiased;
        }

        nav { background-color: #f5f4f0; }
        nav a { color: #000; }
        nav a::after { background: #111; }
        .menu-toggle span { background: #111; }

        .page-header {
          padding: clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 3rem);
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f5f4f0;
        }

        .page-header img { width: 300px; height: auto; }

        .gallery {
          padding: 0 clamp(1.5rem, 5vw, 3rem) clamp(3rem, 5vw, 5rem);
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: minmax(150px, auto);
          gap: clamp(0.75rem, 2vw, 1.5rem);
        }

        .gallery-item {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
          transform: translateY(20px);
          min-height: 150px;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px));
        }

        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .gallery-item { opacity: 1; transform: none; animation: none; }
        }

        .gallery-item:nth-child(1) { animation-delay: 0.1s; grid-column: 1 / 3; grid-row: span 2; }
        .gallery-item:nth-child(2) { animation-delay: 0.15s; grid-column: 3 / 4; grid-row: span 1; }
        .gallery-item:nth-child(3) { animation-delay: 0.2s; grid-column: 3 / 4; grid-row: span 1; }
        .gallery-item:nth-child(4) { animation-delay: 0.25s; grid-column: 4 / 6; grid-row: span 2; }
        .gallery-item:nth-child(5) { animation-delay: 0.3s; grid-column: 6 / 7; grid-row: span 1; }
        .gallery-item:nth-child(6) { animation-delay: 0.35s; grid-column: 1 / 3; grid-row: span 2; }
        .gallery-item:nth-child(7) { animation-delay: 0.4s; grid-column: 3 / 5; grid-row: span 1; }
        .gallery-item:nth-child(8) { animation-delay: 0.45s; grid-column: 5 / 7; grid-row: span 1; }
        .gallery-item:nth-child(9) { animation-delay: 0.5s; grid-column: 3 / 4; grid-row: span 2; }
        .gallery-item:nth-child(10) { animation-delay: 0.55s; grid-column: 4 / 7; grid-row: span 2; }
        .gallery-item:nth-child(n+11) { animation-delay: 0.6s; grid-column: span 2; grid-row: span 1; }

        .gallery-item:hover {
          transform: scale(1.02) translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          z-index: 10;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-item:hover img { transform: scale(1.05); }

        .product-title {
          position: absolute;
          top: clamp(1rem, 2vw, 1.5rem);
          left: clamp(1rem, 2vw, 1.5rem);
          background: var(--accent-yellow);
          padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.875rem, 2vw, 1.25rem);
          font-weight: 700;
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
          letter-spacing: 0.05em;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          color: #111;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        .gallery-item:hover .product-title { opacity: 1; transform: translateY(0); }

        @media (hover: none) and (pointer: coarse) {
          .product-title { opacity: 1; transform: translateY(0); }
        }

        .character-label {
          position: absolute;
          bottom: clamp(1rem, 2vw, 1.5rem);
          left: clamp(1rem, 2vw, 1.5rem);
          background: #000;
          color: white;
          padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.875rem, 2vw, 1.25rem);
          font-weight: 700;
          font-size: clamp(0.75rem, 1.5vw, 0.875rem);
          letter-spacing: 0.05em;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        .gallery-item:hover .character-label { opacity: 1; transform: translateY(0); }

        @media (hover: none) and (pointer: coarse) {
          .character-label { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1200px) {
          .gallery { grid-template-columns: repeat(4, 1fr); }
          .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: span 2; }
          .gallery-item:nth-child(2) { grid-column: 3 / 4; grid-row: span 1; }
          .gallery-item:nth-child(3) { grid-column: 4 / 5; grid-row: span 1; }
          .gallery-item:nth-child(4) { grid-column: 3 / 5; grid-row: span 2; }
          .gallery-item:nth-child(5) { grid-column: 1 / 2; grid-row: span 1; }
          .gallery-item:nth-child(6) { grid-column: 2 / 4; grid-row: span 2; }
          .gallery-item:nth-child(7) { grid-column: 4 / 5; grid-row: span 1; }
          .gallery-item:nth-child(8) { grid-column: 1 / 3; grid-row: span 1; }
          .gallery-item:nth-child(9) { grid-column: 4 / 5; grid-row: span 2; }
          .gallery-item:nth-child(10) { grid-column: 1 / 4; grid-row: span 2; }
        }

        @media (max-width: 900px) {
          .gallery { grid-template-columns: repeat(3, 1fr); }
          .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: span 2; }
          .gallery-item:nth-child(2) { grid-column: 3 / 4; grid-row: span 1; }
          .gallery-item:nth-child(3) { grid-column: 3 / 4; grid-row: span 1; }
          .gallery-item:nth-child(4) { grid-column: 1 / 3; grid-row: span 2; }
          .gallery-item:nth-child(5) { grid-column: 3 / 4; grid-row: span 1; }
          .gallery-item:nth-child(6) { grid-column: 1 / 2; grid-row: span 2; }
          .gallery-item:nth-child(7) { grid-column: 2 / 4; grid-row: span 1; }
          .gallery-item:nth-child(8) { grid-column: 2 / 4; grid-row: span 1; }
          .gallery-item:nth-child(9) { grid-column: 1 / 2; grid-row: span 2; }
          .gallery-item:nth-child(10) { grid-column: 2 / 4; grid-row: span 2; }
        }

        @media (max-width: 640px) {
          .gallery { grid-template-columns: repeat(2, 1fr); grid-auto-rows: minmax(120px, auto); }
          .gallery-item:nth-child(n) { grid-column: auto; grid-row: auto; }
          .gallery-item:nth-child(1) { grid-column: 1 / 3; grid-row: span 1; }
        }

        @media (max-width: 400px) {
          .gallery { grid-template-columns: 1fr; grid-auto-rows: minmax(180px, auto); }
          .gallery-item:nth-child(n) { grid-column: auto; grid-row: auto; }
          .page-header img { width: 200px; }
        }

      `}</style>

      {/* Logo header */}
      <div className="page-header">
        <a href="/">
          <img src="/asset/images/logo/logo-b.png" alt="Nofoal" />
        </a>
      </div>

      {/* Product Gallery */}
      <div className="gallery">
        <ProductsGrid products={displayProducts} />
      </div>

      <ClientModals />
    </>
  );
}
