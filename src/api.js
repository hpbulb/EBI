const endpoint = import.meta.env.VITE_EBI_ADMIN_API || "/backend/admin-dashboard.php";

async function request(options = {}) {
  const response = await fetch(endpoint, { credentials: "include", ...options });
  const body = await response.text();
  try { return JSON.parse(body); } catch { throw new Error("The EBI server returned an invalid response."); }
}

export const getSession = () => request({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "session" }),
});

export const signOut = () => request({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "logout" }),
});

export const getStudents = () => request();
