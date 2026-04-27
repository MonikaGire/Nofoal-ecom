import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import ClientProductPage from '@/components/ClientProductPage';
import { getFallbackProduct } from '@/lib/productData';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${slug}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return getFallbackProduct(slug);
    const data = await res.json();
    return data.product || getFallbackProduct(slug);
  } catch {
    return getFallbackProduct(slug);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found | Nofoal' };
  return {
    title: `Nofoal | ${product.title}`,
    description: product.description.replace(/\n/g, ' '),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return <ClientProductPage product={product} />;
}
