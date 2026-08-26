export const queryKeys = {
  dashboard: {
    all: ["dashboard"],
    role: (role) => ["dashboard", role],
  },
  listings: {
    all: ["listings"],
    list: (userId, filters = {}) => ["listings", userId || "anonymous", filters],
    details: ["listing"],
    detail: (userId, id) => ["listing", userId || "anonymous", id],
  },
  orders: {
    all: ["orders"],
    list: (userId) => ["orders", userId || "anonymous"],
  },
  payments: {
    all: ["payments"],
    list: (userId) => ["payments", userId || "anonymous"],
  },
};
