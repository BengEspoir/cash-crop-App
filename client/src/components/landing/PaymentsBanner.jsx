const methods = ["MTN MoMo", "Orange Money", "Visa", "Mastercard", "Flutterwave", "Wire Transfer"];

export function PaymentsBanner() {
  return (
    <section className="rounded-[26px] bg-[#1A6B3C] px-6 py-8 text-white shadow-[0_30px_90px_rgba(21,66,33,0.22)] lg:px-8 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-5">
          <p className="section-eyebrow text-[#FFC75E]">Protected Payments</p>
          <h2 className="font-display text-[24px] leading-[1.1] text-white">Payment flexibility built into the trade flow.</h2>
          <p className="text-[15px] leading-8 text-white/85">
            Support mobile money, cards, and transfer-ready settlement paths depending on buyer profile, order structure, and delivery route.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7 xl:grid-cols-3">
          {methods.map((method, index) => (
            <div
              key={method}
              className={`rounded-[16px] px-5 py-4 text-center text-[14px] font-semibold shadow-md ${
                index % 2 === 0
                  ? "bg-white/15 text-white"
                  : "bg-[#FDF8EE]/80 text-[#111827]"
              }`}
            >
              {method}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
