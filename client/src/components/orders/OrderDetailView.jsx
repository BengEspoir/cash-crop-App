import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { ShipmentTrackerCard } from "@/components/logistics/ShipmentTrackerCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

const workspaceConfig = {
  admin: {
    label: "Admin",
    dashboardHref: "/admin/dashboard",
    ordersHref: "/admin/orders",
    missing: "This order is not present in the database response.",
  },
  buyer: {
    label: "Buyer",
    dashboardHref: "/buyer/dashboard",
    ordersHref: "/buyer/orders",
    missing: "This order is not connected to your buyer profile.",
  },
  farmer: {
    label: "Farmer",
    dashboardHref: "/farmer/dashboard",
    ordersHref: "/farmer/orders",
    missing: "This order is not connected to your farmer profile.",
  },
};

export function OrderDetailView({ action, isLoading, order, shipment, workspace }) {
  const config = workspaceConfig[workspace] || workspaceConfig.buyer;

  if (isLoading) {
    return <EmptyState title="Loading live order" description="Fetching order details from the database." />;
  }

  if (!order) {
    return <EmptyState title="Live order not found" description={config.missing} />;
  }

  const orderId = order.rawId || order.id;
  return (
    <section className="space-y-6">
      <Breadcrumb
        items={[
          { label: config.label, href: config.dashboardHref },
          { label: "Orders", href: config.ordersHref },
          { label: order.id },
        ]}
      />
      <PageHeader eyebrow="Order detail" title={order.id} description={order.notes} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <OrderCard order={order} href={`${config.ordersHref}/${orderId}`} action={action} />
        <OrderTimeline items={order.timeline || []} />
      </div>
      {workspace === "buyer" ? <ShipmentTrackerCard shipment={shipment} /> : null}
    </section>
  );
}
