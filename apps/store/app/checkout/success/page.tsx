import SuccessView from "../../../components/SuccessView";

const MARKETING_SITE_URL = process.env.NEXT_PUBLIC_MARKETING_SITE_URL || "https://www.zevlinbike.com";

export default function CheckoutSuccessPage() {
  return <SuccessView marketingSiteUrl={MARKETING_SITE_URL} />;
}
