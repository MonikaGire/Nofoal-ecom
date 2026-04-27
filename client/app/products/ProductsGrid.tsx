interface DisplayProduct {
  slug: string;
  title: string;
  coverImage: string;
}

interface Props {
  products: DisplayProduct[];
}

export default function ProductsGrid({ products }: Props) {
  return (
    <>
      {products.map((product) => (
        <div className="gallery-item" key={product.slug}>
          <a href={`/products/${product.slug}`}>
            <img src={product.coverImage} alt={product.title} />
            <div className="product-title">{product.title}</div>
            <p className="character-label">View →</p>
          </a>
        </div>
      ))}
    </>
  );
}
