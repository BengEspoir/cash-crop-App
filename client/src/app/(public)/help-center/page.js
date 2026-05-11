import { Card } from "../../../components/ui/card";
import { PageHeader } from "../../../components/common/PageHeader";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { Search, MessageCircle, FileText, Phone, Mail, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: Info,
    questions: [
      "How do I create an account on AgriculNet?",
      "What documents do I need to verify my account?",
      "How does the verification process work?",
      "Can I have both buyer and seller accounts?",
    ],
  },
  {
    title: "For Farmers",
    icon: CheckCircle,
    questions: [
      "How do I list my crops for sale?",
      "What are the pricing guidelines?",
      "How do I handle buyer inquiries?",
      "What are the inspection requirements?",
    ],
  },
  {
    title: "For Buyers",
    icon: CheckCircle,
    questions: [
      "How do I search for specific crops?",
      "How do I place an order?",
      "What payment methods are accepted?",
      "How does the export process work?",
    ],
  },
  {
    title: "Payments & Security",
    icon: AlertCircle,
    questions: [
      "How are payments protected?",
      "What happens if there's a dispute?",
      "How do I get paid as a farmer?",
      "What are the security measures?",
    ],
  },
];

const contactMethods = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    icon: MessageCircle,
    availability: "Mon-Fri: 8AM-6PM WAT",
    action: "Start Chat",
  },
  {
    title: "Email Support",
    description: "Send us detailed questions or issues",
    icon: Mail,
    availability: "Response within 24 hours",
    action: "Send Email",
  },
  {
    title: "Phone Support",
    description: "Speak directly with our experts",
    icon: Phone,
    availability: "Mon-Fri: 9AM-5PM WAT",
    action: "Call Now",
  },
  {
    title: "Documentation",
    description: "Browse our comprehensive guides",
    icon: FileText,
    availability: "Available 24/7",
    action: "View Docs",
  },
];

const quickGuides = [
  {
    title: "Account Setup Guide",
    description: "Step-by-step instructions for creating and verifying your account",
    readTime: "5 min read",
  },
  {
    title: "Listing Crops for Sale",
    description: "Everything farmers need to know about creating effective listings",
    readTime: "8 min read",
  },
  {
    title: "Making Your First Purchase",
    description: "Complete guide for buyers new to the AgriculNet platform",
    readTime: "6 min read",
  },
  {
    title: "Payment Protection Explained",
    description: "Understanding how our payment system keeps everyone safe",
    readTime: "4 min read",
  },
];

export default function HelpCenterPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Help Center"
        title="Find answers and get support"
        description="Everything you need to know about using AgriculNet, from account setup to advanced features. Get help from our team or explore our comprehensive documentation."
      />

      {/* Search Bar */}
      <Card className="rounded-[18px] p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="search"
            placeholder="Search for help articles, FAQs, or contact support..."
            className="w-full rounded-full border border-[#D1D5DB] bg-white py-4 pl-12 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#1A6B3C] focus:outline-none"
          />
        </div>
      </Card>

      {/* FAQ Categories */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">Browse by Category</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Find answers to common questions organized by topic
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="rounded-[18px] p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="font-display text-[18px] leading-[1.15] text-[#111827]">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.questions.map((question) => (
                        <li key={question}>
                          <button className="text-left text-[14px] leading-6 text-[#374151] hover:text-[#1A6B3C] hover:underline">
                            {question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Guides */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">Quick Start Guides</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Step-by-step guides to help you get started quickly
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quickGuides.map((guide) => (
            <Card key={guide.title} className="rounded-[18px] p-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-[16px] leading-[1.15] text-[#111827]">{guide.title}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-1 text-[11px] font-medium text-[#6B7280]">
                    <Clock className="h-3 w-3" />
                    {guide.readTime}
                  </span>
                </div>
                <p className="text-[14px] leading-6 text-[#6B7280]">{guide.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Read Guide
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="font-display text-[20px] leading-[1.15] text-[#111827]">Contact Support</h2>
          <p className="text-[14px] leading-6 text-[#6B7280]">
            Can't find what you're looking for? Our support team is here to help
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card key={method.title} className="rounded-[18px] p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4EE] text-[#1A6B3C]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-[16px] leading-[1.15] text-[#111827]">{method.title}</h3>
                    <p className="text-[13px] leading-5 text-[#6B7280]">{method.description}</p>
                    <p className="text-[12px] leading-4 text-[#9CA3AF]">{method.availability}</p>
                  </div>
                  <Button className="w-full" size="sm">
                    {method.action}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Still Need Help */}
      <Card className="rounded-[18px] bg-[#EAF4EE] p-6">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1A6B3C] text-white">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-display text-[18px] leading-[1.15] text-[#111827]">Still need help?</h3>
            <p className="text-[14px] leading-6 text-[#6B7280]">
              Our support team is ready to assist you with any questions or issues you may have.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="mailto:support@agriculnet.com">Email Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="tel:+237123456789">Call Now</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}