import HeroSection from "../components/common/HeroSection";
import HowItWorksSection from "../components/common/HowItWorksSection";

export default function DashboardPage() {
  return (
    <div className="page-section">
      <HeroSection />
      <HowItWorksSection />
    </div>
  );
}