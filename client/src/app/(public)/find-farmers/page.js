"use client";

import { PageHeader } from "../../../components/common/PageHeader";
import { EmptyState } from "../../../components/common/EmptyState";
import { FarmerMiniCard } from "../../../components/farmers/FarmerMiniCard";
import { Card } from "../../../components/ui/card";
import { useFarmers } from "../../../hooks/useFarmers";

export default function FindFarmersPage() {
  const { farmers, isLoading, error } = useFarmers();

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Farmer Network"
        title="Find farmers by region and crop readiness"
        description="Browse real farmer profiles and review verification status before starting conversations or quote requests."
      />

      {isLoading ? (
        <Card className="rounded-[16px] p-8 text-center text-ink-500">Loading real farmer profiles...</Card>
      ) : error ? (
        <Card className="rounded-[16px] p-8 text-center text-red-700">Farmers could not be loaded.</Card>
      ) : farmers.length ? (
        <div className="grid gap-4">
          {farmers.map((farmer) => (
            <FarmerMiniCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      ) : (
        <EmptyState title="No farmers yet" description="Farmer profiles will appear here once accounts are created." />
      )}
    </section>
  );
}
