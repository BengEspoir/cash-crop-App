export function buildQuoteRequestMessage(form) {
  return [
    form.variety ? `Variety: ${form.variety}` : null,
    form.grade ? `Required grade: ${form.grade}` : null,
    form.destination ? `Destination: ${form.destination}` : null,
    form.incoterm ? `Shipment term: ${form.incoterm}` : null,
    form.deliveryTiming ? `Delivery timing: ${form.deliveryTiming}` : null,
    form.contactName ? `Contact: ${form.contactName}` : null,
    form.company ? `Company: ${form.company}` : null,
    form.email ? `Email: ${form.email}` : null,
    form.phone ? `Phone: ${form.phone}` : null,
    form.packaging ? `Packaging: ${form.packaging}` : null,
    form.notes ? `Additional requirements: ${form.notes}` : null,
  ].filter(Boolean).join("\n");
}

