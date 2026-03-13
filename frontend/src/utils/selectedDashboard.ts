const SELECTED_DASHBOARD_ID_KEY = "selected_dashboard_id";

export function getSelectedDashboardId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(SELECTED_DASHBOARD_ID_KEY);
}

export function setSelectedDashboardId(dashboardId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextDashboardId = String(dashboardId);
  localStorage.setItem(SELECTED_DASHBOARD_ID_KEY, nextDashboardId);
  window.dispatchEvent(
    new CustomEvent("selected-dashboard-changed", {
      detail: { dashboardId: nextDashboardId },
    }),
  );
}
