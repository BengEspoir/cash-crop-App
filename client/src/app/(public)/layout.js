import { Header } from "../../components/layout/Header";
import { SubNav } from "../../components/layout/SubNav";
import { Footer } from "../../components/layout/Footer";
import { SkipToContent } from "../../components/a11y/SkipToContent";

export default function PublicRouteLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SkipToContent />
      <Header />
      <SubNav />
      <main id="main-content" tabIndex={-1} className="content-shell py-8 lg:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
