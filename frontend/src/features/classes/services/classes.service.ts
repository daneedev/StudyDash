import { apiFetch } from "../../../lib/apiClient";
import type {
  ClassApiItem,
  ClassesApiResponse,
  ClassItem,
} from "../types/classes.types";

function getClassItems(payload: ClassesApiResponse): ClassApiItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.data?.classes)) {
    return payload.data.classes;
  }

  return [];
}

function mapClassItem(item: ClassApiItem): ClassItem {
  return {
    id: item.class?.id || item.id || "",
    name: item.class?.name || item.name || "Bez názvu",
    inviteCode: item.class?.inviteCode || item.inviteCode || "",
    isAdmin: item.role === "admin",
  };
}

export async function getClasses() {
  const payload = await apiFetch<ClassesApiResponse>("/classes");

  return getClassItems(payload)
    .map(mapClassItem)
    .filter((classItem) => classItem.id);
}

export async function createClass(name: string) {
  await apiFetch("/classes", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() }),
  });
}

export async function deleteClass(id: string) {
  await apiFetch(`/classes/${id}`, {
    method: "DELETE",
  });
}

export async function joinClass(inviteCode: string) {
  await apiFetch(`/classes/join/${inviteCode.trim()}`, {
    method: "POST",
  });
}
