import { Client } from "pg";

async function run(): Promise<void> {
  const sourceUrl = process.env.OLD_DATABASE_URL;
  const targetUrl = process.env.DATABASE_URL;

  if (!sourceUrl || !targetUrl) {
    throw new Error("OLD_DATABASE_URL and DATABASE_URL are required");
  }

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });

  await source.connect();
  await target.connect();

  try {
    await target.query("BEGIN");

    const products = await source.query(
      `SELECT id, name, slug, description, price_cents, COALESCE(quantity_in_stock, 0) AS quantity_in_stock, weight AS weight_grams, length_cm, width_cm, height_cm
       FROM products`,
    );

    for (const row of products.rows) {
      await target.query(
        `INSERT INTO products (id, name, slug, description, price_cents, quantity_in_stock, weight_grams, length_cm, width_cm, height_cm)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.name,
          row.slug,
          row.description,
          row.price_cents,
          row.quantity_in_stock,
          row.weight_grams,
          row.length_cm,
          row.width_cm,
          row.height_cm,
        ],
      );
    }

    const customers = await source.query(
      `SELECT id, auth_user_id, first_name, last_name, email, phone
       FROM customers`,
    );

    for (const row of customers.rows) {
      await target.query(
        `INSERT INTO customers (id, auth_user_id, first_name, last_name, email, phone_encrypted)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO NOTHING`,
        [row.id, row.auth_user_id, row.first_name, row.last_name, row.email, row.phone],
      );
    }

    const orders = await source.query(
      `SELECT id, customer_id, subtotal_cents, shipping_cost_cents, tax_cents, discount_cents, total_cents, stripe_payment_intent_id, payment_status, order_status, shipping_status
       FROM orders`,
    );

    for (const row of orders.rows) {
      await target.query(
        `INSERT INTO orders (
          id, customer_id, subtotal_cents, shipping_cost_cents, tax_cents, discount_cents, total_cents,
          stripe_checkout_session_id, payment_status, fulfillment_status, shipping_status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.customer_id,
          row.subtotal_cents,
          row.shipping_cost_cents,
          row.tax_cents,
          row.discount_cents,
          row.total_cents,
          row.stripe_payment_intent_id,
          row.payment_status ?? "pending",
          row.order_status ?? "pending_payment",
          row.shipping_status ?? "not_shipped",
        ],
      );
    }

    await target.query("COMMIT");
    console.info("Selective migration completed: products, customers, orders");
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
