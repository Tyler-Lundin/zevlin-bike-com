import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "../../../components/ProductDetailView";
import { getStoreProduct, storeCatalog } from "../../../lib/catalog";

export function generateStaticParams() {
  return storeCatalog.map((product) => ({ slug: product.slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProduct(slug);
  if (!product) {
    return {
      title: "Product not found | Zevlin Store",
    };
  }

  return {
    title: `${product.name} | Zevlin Store`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getStoreProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
