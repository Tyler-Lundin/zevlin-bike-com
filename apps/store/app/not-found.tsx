import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="section-kicker">Store</p>
        <h1>That product is not here.</h1>
        <p className="section-body">Return to the Zevlin catalog to continue shopping the current lineup.</p>
      </section>
      <div className="surface-card empty-state-card">
        <Link href="/" className="button-primary">
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
