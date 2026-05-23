import { Card } from "../../../components/ui/card";
import { PageHeader } from "../../../components/common/PageHeader";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { CheckCircle, TrendingUp, Shield, Users, DollarSign, Truck, Award, Star, ArrowRight, Leaf } from "lucide-react";

const benefits = [
  {
    title: "Access to International Markets",
    description: "Connect with buyers from around the world and expand your reach beyond local markets",
    icon: TrendingUp,
  },
  {
    title: "Protected Payments",
    description: "Receive payments securely through our escrow system with buyer protection guarantees",
    icon: Shield,
  },
  {
    title: "Verified Buyer Network",
    description: "Sell to pre-verified buyers with established trade relationships and payment history",
    icon: Users,
  },
  {
    title: "Competitive Pricing",
    description: "Set your own prices and access real-time market data to maximize your profits",
    icon: DollarSign,
  },
  {
    title: "Coordinated Logistics",
    description: "Partner with our logistics network for reliable transportation and export documentation",
    icon: Truck,
  },
  {
    title: "Quality Recognition",
    description: "Build your reputation with verified quality standards and buyer reviews",
    icon: Award,
  },
];

const steps = [
  {
    step: "1",
    title: "Create Your Account",
    description: "Register as a farmer and complete our verification process with your farm details and documents",
    details: ["Farm registration", "Document verification", "Profile setup"],
  },
  {
    step: "2",
    title: "List Your Crops",
    description: "Add your available crops with photos, specifications, pricing, and harvest information",
    details: ["Crop specifications", "Quality photos", "Pricing strategy"],
  },
  {
    step: "3",
    title: "Receive Inquiries",
    description: "Qualified buyers will contact you directly with purchase requests and requirements",
    details: ["Buyer verification", "Volume requests", "Custom specifications"],
  },
  {
    step: "4",
    title: "Complete the Sale",
    description: "Process orders through our protected payment system with inspection and logistics support",
    details: ["Payment protection", "Quality inspection", "Export coordination"],
  },
];

const requirements = [
  {
    title: "Farm Information",
    items: ["Farm location and size", "Crop types and varieties", "Harvest seasons and volumes"],
  },
  {
    title: "Legal Documents",
    items: ["Business registration", "Tax identification", "Export permits (if applicable)"],
  },
  {
    title: "Quality Standards",
    items: ["Crop quality specifications", "Storage and handling practices", "Pesticide and chemical records"],
  },
];

const successStories = [
  {
    farmer: "Marie Kouam",
    location: "West Region, Cameroon",
    crop: "Arabica Coffee",
    achievement: "Increased export sales by 300%",
    quote: "AgriculNet connected me with international buyers I never could have reached before.",
  },
  {
    farmer: "Joseph Mbarga",
    location: "Littoral Region, Cameroon",
    crop: "Cocoa Beans",
    achievement: "Secured premium pricing contracts",
    quote: "The platform's verification system gave buyers confidence in my product quality.",
  },
  {
    farmer: "Grace Ndongo",
    location: "South West Region, Cameroon",
    crop: "Penja Pepper",
    achievement: "Expanded to 5 new international markets",
    quote: "The logistics coordination made exporting hassle-free for the first time.",
  },
];

export default function SellOnAgriculNetPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Sell on AgriculNet"
        title="Grow your farm business with global reach"
        description="Join thousands of Cameroonian farmers who are expanding their markets, securing better prices, and building sustainable businesses through our verified marketplace."
        actions={
          <Button asChild size="lg">
            <Link href="/register/farmer">
              Start Selling Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* Hero Stats */}
      <Card className="rounded-[18px] bg-[#1A6B3C] p-8 text-white">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="text-[32px] font-bold">340+</div>
            <div className="text-[14px] opacity-90">Verified Farmers</div>
          </div>
          <div className="text-center">
            <div className="text-[32px] font-bold">120</div>
            <div className="text-[14px] opacity-90">Export-Ready Listings</div>
          </div>
          <div className="text-[32px] font-bold text-center">
            <div>18</div>
            <div className="text-[14px] opacity-90">Crop Categories</div>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">Why Sell on AgriculNet?</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Discover the advantages of joining Cameroon&apos;s premier agricultural marketplace
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="rounded-[18px] p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-[16px] leading-[1.15] text-[#111827]">{benefit.title}</h3>
                    <p className="text-[14px] leading-6 text-[#6B7280]">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">How It Works</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Get started with selling on AgriculNet in just four simple steps
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card key={step.step} className="rounded-[18px] p-6">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A6B3C] text-[18px] font-bold text-white">
                  {step.step}
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-display text-[18px] leading-[1.15] text-[#111827]">{step.title}</h3>
                  <p className="text-[14px] leading-6 text-[#6B7280]">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.details.map((detail) => (
                      <span
                        key={detail}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] text-[#6B7280]"
                      >
                        <CheckCircle className="h-3 w-3" />
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">What You Need to Get Started</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Ensure you have these ready for a smooth onboarding process
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {requirements.map((requirement) => (
            <Card key={requirement.title} className="rounded-[18px] p-6">
              <div className="space-y-4">
                <h3 className="font-display text-[16px] leading-[1.15] text-[#111827]">{requirement.title}</h3>
                <ul className="space-y-2">
                  {requirement.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[14px] leading-6 text-[#6B7280]">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1A6B3C]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">Success Stories</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Real farmers sharing their AgriculNet success stories
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {successStories.map((story) => (
            <Card key={story.farmer} className="rounded-[18px] p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-[14px] leading-[1.15] text-[#111827]">{story.farmer}</h4>
                    <p className="text-[12px] text-[#6B7280]">{story.location}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF4EE] px-2 py-1 text-[11px] font-medium text-[#1A6B3C]">
                      <Star className="h-3 w-3" />
                      {story.crop}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[#1A6B3C]">{story.achievement}</p>
                  <p className="text-[13px] leading-5 text-[#6B7280] italic">&quot;{story.quote}&quot;</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="rounded-[18px] bg-[#1A6B3C] p-8 text-white">
        <div className="text-center space-y-4">
          <h2 className="font-display text-[24px] leading-[1.15]">Ready to Start Selling?</h2>
          <p className="text-[16px] opacity-90 max-w-2xl mx-auto">
            Join the growing community of successful Cameroonian farmers who are reaching new markets and building sustainable businesses.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register/farmer">
                Register as Farmer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#1A6B3C]">
              <Link href="/help-center">Learn More</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
