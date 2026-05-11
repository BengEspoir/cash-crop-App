import { Button } from "../ui/button";

const steps = [
  { step: "01", title: "Create a verified profile", copy: "Farmers and buyers submit the details needed for a protected marketplace presence." },
  { step: "02", title: "Browse or request a quote", copy: "Buyers search by crop, region, readiness, and sourcing needs before they engage." },
  { step: "03", title: "Confirm inspection and payment", copy: "Protected payment rails and document checks reduce risk before dispatch." },
  { step: "04", title: "Track the order to completion", copy: "AgriculNet supports handoff, logistics visibility, and dispute coordination." },
];

export function HowItWorks() {
  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:items-start animate-fade-in">
      <div className="rounded-[24px] border border-transparent bg-[#FEF3D5] p-7 shadow-[0_30px_90px_rgba(255,155,0,0.12)] lg:col-span-4 animate-slide-up">
        <p className="section-eyebrow text-[#B5892A]">How It Works</p>
        <h2 className="mt-3 font-display text-[24px] leading-[1.12] text-[#111827]">A clearer trade journey from inquiry to delivery.</h2>
        <p className="mt-4 text-[15px] leading-8 text-[#4B5563]">
          The workflow is built for structured onboarding, verified supply, protected order handling, and better visibility through each trade stage.
        </p>
        <Button variant="secondary" className="mt-6">Start onboarding</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 animate-slide-up">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className={`rounded-[20px] p-6 shadow-sm ${
              index % 2 === 0 ? "bg-[#EAF4EE]" : "bg-[#FFF8ED]"
            } animate-bounce-in`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1A6B3C] text-[13px] font-semibold text-white shadow-sm">
              {step.step}
            </span>
            <h3 className="mt-5 text-[16px] font-semibold text-[#111827]">{step.title}</h3>
            <p className="mt-3 text-[14px] leading-7 text-[#475569]">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
