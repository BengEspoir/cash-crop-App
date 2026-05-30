"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeListingForCart = (listing) => {
  if (!listing) return null;

  return {
    id: listing.id,
    crop: listing.crop,
    location: listing.location,
    quantityLabel: listing.quantityLabel || listing.quantity,
    quantityUnit: listing.quantityUnit || "kg",
    price: listing.price,
    priceValue: listing.priceValue || listing.pricePerUnit || 0,
    currency: listing.currency || "XAF",
    imageSrc: listing.imageSrc || null,
    farmer: listing.farmer || null,
    seller: listing.seller || listing.farmer || null,
    sellerVerificationStatus: listing.sellerVerificationStatus || listing.farmerVerificationStatus || "not_started",
  };
};

export const useCartStore = create(
  persist(
    (set) => ({
      item: null,
      setListing: (listing) => set({
        item: {
          listing: normalizeListingForCart(listing),
          quantity: 1,
          notes: "",
          shippingAddress: "",
          billingAddress: "",
        },
      }),
      updateItem: (payload) => set((state) => ({
        item: state.item ? { ...state.item, ...payload } : state.item,
      })),
      clearCart: () => set({ item: null }),
    }),
    {
      name: "agriculnet-single-order-cart",
    },
  ),
);
