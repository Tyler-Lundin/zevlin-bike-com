import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-stack store-route-stack">
      <section className="store-frame section-heading section-heading-wide">
        <p className="section-kicker">Store</p>
        <h1>That product is not in the lineup.</h1>
        <p className="section-body">Return to the catalog to continue shopping the current Zevlin collection.</p>
      </section>
      <div className="store-frame surface-card empty-state-card">
        <Link href="/" className="button-primary">
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
