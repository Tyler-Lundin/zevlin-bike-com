import Link from "next/link";
import FeaturedProductStage from "../components/FeaturedProductStage";
import ProductCard from "../components/ProductCard";
import { storeCatalog } from "../lib/catalog";

export default function HomePage() {
  const [featuredProduct, ...catalogProducts] = storeCatalog;

  return (
    <div className="store-homepage">
      <section className="store-section store-opening-section">
        <div className="store-frame store-opening-grid">
          <div className="store-opening-copy">
            <p className="section-kicker">Zevlin store</p>
            <h1>Ride essentials with the noise stripped out.</h1>
            <p className="section-body store-opening-deck">
              Five products. Clear roles. Direct checkout. A retail experience built to stay out of the way once the job is obvious.
            </p>
          </div>

          <div className="store-opening-rail" aria-label="Store policies">
            <article className="surface-card store-rail-card">
              <p className="store-rail-label">Shipping</p>
              <h2>Free above $49.</h2>
            </article>
            <article className="surface-card store-rail-card">
              <p className="store-rail-label">Returns</p>
              <h2>30-day window, kept simple.</h2>
            </article>
            <article className="surface-card store-rail-card">
              <p className="store-rail-label">Support</p>
              <h2>Direct human help, not a queue maze.</h2>
            </article>
          </div>
        </div>
      </section>

      <FeaturedProductStage product={featuredProduct} />

      <section id="lineup" className="store-section">
        <div className="store-frame section-heading section-heading-wide">
          <p className="section-kicker">Lineup</p>
          <h2>Everything in the collection, shown cleanly.</h2>
          <p className="section-body">The featured product leads the page. The rest of the lineup stays visible, consistent, and quick to scan.</p>
        </div>

        <div className="store-frame catalog-grid" aria-label="Product catalog">
          {catalogProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="guide" className="store-section store-guide-section">
        <div className="store-frame store-guide-grid">
          <div className="section-heading section-heading-wide">
            <p className="section-kicker">Use-case guide</p>
            <h2>Choose by ride-day need, not by marketing category.</h2>
          </div>

          <div className="store-guide-cards">
            {storeCatalog.map((product) => (
              <article key={product.id} className="surface-card store-guide-card">
                <p className="store-guide-label">{product.usageLabel}</p>
                <h3>{product.name}</h3>
                <p>{product.bestFor[0]}</p>
                <Link href={`/products/${product.slug}`} className="store-inline-link">
                  See product
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="support" className="store-section store-support-section">
        <div className="store-frame store-support-grid">
          <article className="surface-card store-support-card">
            <p className="store-rail-label">Shipping</p>
            <h2>Free above the threshold. Flat rate below it.</h2>
          </article>
          <article className="surface-card store-support-card">
            <p className="store-rail-label">Returns</p>
            <h2>Clear 30-day handling with direct Zevlin support.</h2>
          </article>
          <article className="surface-card store-support-card store-support-card-primary">
            <p className="store-rail-label">Need a human?</p>
            <h2>Email support and move forward.</h2>
            <a href="mailto:zevlinbike@gmail.com" className="store-inline-link">
              zevlinbike@gmail.com
            </a>
          </article>
        </div>
      </section>
    </div>
  );
}
