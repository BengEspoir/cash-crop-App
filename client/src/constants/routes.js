import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Landmark,
  Map,
  Search,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingBasket,
  Sprout,
  Truck,
  Users,
  ScrollText,
  Plus,
} from "lucide-react";

export const buyerNavigation = [
  { href: "/buyer/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/browse", id: "browse", label: "Browse Crops", icon: Search },
  { href: "/find-farmers", id: "findFarmers", label: "Find Farmers", icon: Users },
  { href: "/buyer/saved", id: "saved", label: "Saved Crops", icon: ShoppingBasket },
  { href: "/buyer/orders", id: "orders", label: "My Orders", icon: Package },
  { href: "/buyer/messages", id: "messages", label: "Messages", icon: MessageSquare },
  { href: "/buyer/payments", id: "payments", label: "Payments", icon: CreditCard },
  { href: "/buyer/profile", id: "profile", label: "My Profile", icon: Users },
  { href: "/buyer/settings", id: "settings", label: "Settings", icon: Settings },
  { href: "/buyer/help-support", id: "helpSupport", label: "Help & Support", icon: HelpCircle },
];

export const farmerNavigation = [
  { href: "/farmer/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/farmer/listings", id: "listings", label: "My Listings", icon: Sprout },
  { href: "/farmer/listings/new", id: "addListing", label: "Add New Listing", icon: Plus },
  { href: "/farmer/orders", id: "orders", label: "My Orders", icon: Package },
  { href: "/farmer/messages", id: "messages", label: "Messages", icon: MessageSquare },
  { href: "/farmer/payments", id: "payments", label: "Payments", icon: CreditCard },
  { href: "/farmer/notifications", id: "notifications", label: "Notifications", icon: Bell },
  { href: "/farmer/profile", id: "profile", label: "Profile", icon: Users },
  { href: "/farmer/settings", id: "settings", label: "Settings", icon: Settings },
  { href: "/farmer/help-support", id: "helpSupport", label: "Help & Support", icon: HelpCircle },
];

export const adminNavigation = [
  { href: "/admin/dashboard", id: "dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/users", id: "users", label: "Users", icon: Users },
  { href: "/admin/listings", id: "listings", label: "Listings", icon: Sprout },
  { href: "/admin/orders", id: "orders", label: "Orders", icon: Package },
  { href: "/admin/payments", id: "payments", label: "Payments", icon: Landmark },
  { href: "/admin/inspections", id: "inspections", label: "Inspections", icon: Shield },
  { href: "/admin/logistics", id: "logistics", label: "Logistics", icon: Truck },
  { href: "/admin/disputes", id: "disputes", label: "Disputes", icon: ClipboardList },
  { href: "/admin/analytics", id: "analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", id: "settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", id: "auditLogs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/help-support", id: "helpSupport", label: "Help & Support", icon: HelpCircle },
];

export const publicMarketplaceLinks = [
  { href: "/browse", label: "Browse Crops", icon: Sprout },
  { href: "/find-farmers", label: "Find Farmers", icon: Users },
  { href: "/request-quote", label: "Request a Quote", icon: ClipboardList },
  { href: "/international", label: "Export Program", icon: Map },
  { href: "/buyer-protection", label: "Buyer Protection", icon: Shield },
];
