import api from "./axios";

export async function uploadAsset(file, { folder = "listings", onProgress } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const { data } = await api.post("/uploads/assets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(event.loaded / event.total);
    },
  });

  return data.data;
}
