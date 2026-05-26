import { HomeMarketplaceEcosystem } from "../components/landing/HomeMarketplaceEcosystem";
import { AnnouncementStrip } from "../components/landing/AnnouncementStrip";
import { HeroSection } from "../components/landing/HeroSection";
import { HeroSearchBar } from "../components/landing/HeroSearchBar";
import { TrustStrip } from "../components/landing/TrustStrip";
import { CropGrid } from "../components/landing/CropGrid";
import { RegionalSpotlight } from "../components/landing/RegionalSpotlight";
import { FeaturedFarmers } from "../components/landing/FeaturedFarmers";
import { HowItWorks } from "../components/landing/HowItWorks";
import { PaymentsBanner } from "../components/landing/PaymentsBanner";
import { Header } from "../components/layout/Header";
import { SubNav } from "../components/layout/SubNav";
import { Footer } from "../components/layout/Footer";
import { PageTransition } from "../components/motion/PageTransition";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <AnnouncementStrip />
      <Header />
      <SubNav />
      <main>
        <HeroSection />
        <PageTransition className="content-shell space-y-8 py-8 lg:space-y-12 lg:py-10">
          <HeroSearchBar />
          <TrustStrip />
          <HomeMarketplaceEcosystem />
          <CropGrid />
          <RegionalSpotlight />
          <FeaturedFarmers />
          <HowItWorks />
          <PaymentsBanner />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
