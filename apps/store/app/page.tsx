import ProductCard from "../components/ProductCard";
import { storeCatalog } from "../lib/catalog";

export default function HomePage() {
  const [featuredProduct, ...catalogProducts] = storeCatalog;

  return (
    <div className="page-stack">
      <section className="catalog-hero-grid">
        <article className="surface-card catalog-intro-card">
          <p className="section-kicker">Store</p>
          <h1>Ride essentials. Nothing extra.</h1>
          <p className="section-body">
            The full Zevlin lineup in one restrained catalog. Clear product fit, direct pricing, secure checkout.
          </p>
        </article>

        <article className="surface-card catalog-callout catalog-policy-card">
          <p className="catalog-policy-title">Policy snapshot</p>
          <div className="catalog-policy-list">
            <span>Free shipping over $49</span>
            <span>Flat $5 shipping below that</span>
            <span>30-day returns</span>
          </div>
        </article>
      </section>

      <section className="catalog-highlight-grid" aria-label="Store highlights">
        <article className="surface-card catalog-highlight-card">
          <p className="catalog-highlight-label">Lineup</p>
          <h2>Five products, each with a clear job.</h2>
        </article>
        <article className="surface-card catalog-highlight-card">
          <p className="catalog-highlight-label">Checkout</p>
          <h2>Hosted Stripe flow with no account friction.</h2>
        </article>
        <article className="surface-card catalog-highlight-card">
          <p className="catalog-highlight-label">Support</p>
          <h2>Direct rider help, not a layered ticket maze.</h2>
        </article>
      </section>

      <section className="catalog-grid" aria-label="Product catalog">
        <ProductCard product={featuredProduct} featured />
        {catalogProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
