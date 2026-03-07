const SELECTED_DASHBOARD_ID_KEY = "selected_dashboard_id";

export function getSelectedDashboardId() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(SELECTED_DASHBOARD_ID_KEY);
}

export function setSelectedDashboardId(classId: string | number) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SELECTED_DASHBOARD_ID_KEY, String(classId));
}
