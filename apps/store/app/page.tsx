import ProductCard from "../components/ProductCard";
import { storeCatalog } from "../lib/catalog";

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="section-heading section-heading-tight">
        <p className="section-kicker">Store</p>
        <h1>Ride essentials. Nothing extra.</h1>
        <p className="section-body">
          The full Zevlin lineup in a single calm catalog. Minimal decisions, direct pricing, secure checkout.
        </p>
      </section>

      <section className="surface-card catalog-callout">
        <p>Free shipping over $49. Flat $5 shipping below that threshold. 30-day returns.</p>
      </section>

      <section className="catalog-grid" aria-label="Product catalog">
        {storeCatalog.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
