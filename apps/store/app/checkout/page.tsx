import CheckoutView from "../../components/CheckoutView";

type CheckoutPageProps = {
  searchParams?: Promise<{ cancelled?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const cancelled = resolvedSearchParams?.cancelled === "1";

  return <CheckoutView cancelled={cancelled} />;
}
