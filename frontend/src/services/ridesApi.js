const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getAllRides() {
  const response = await fetch(`${BASE_URL}/api/rides`);
  if (!response.ok) throw new Error("Failed to fetch rides");
  return response.json();
}

export async function parseFitFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/api/rides/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to upload FIT file");
  }

  return response.json();
}

export async function getRideById(id) {
  const response = await fetch(`${BASE_URL}/api/rides/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch ride ${id}`);
  return response.json();
}

export async function getGpsPointsPreview(id, sampleRate = 20) {
  const response = await fetch(
    `${BASE_URL}/api/rides/${id}/gps/preview?sampleRate=${sampleRate}`,
  );
  if (!response.ok) throw new Error(`Failed to fetch GPS points for ride ${id}`);
  return response.json();
}
