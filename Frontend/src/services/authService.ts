const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface RegisterFarmerData {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password: string;
  preferredLanguage?: string;
  state?: string;
  district?: string;
  village?: string;
}

export interface LoginData {
  mobileNumber: string;
  password: string;
}

export async function registerFarmer(
  farmerData: RegisterFarmerData
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(farmerData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Farmer registration failed."
    );
  }

  return data;
}

export async function loginFarmer(
  loginData: LoginData
) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Farmer login failed."
    );
  }

  localStorage.setItem(
    "khetRakshakToken",
    data.token
  );

  localStorage.setItem(
    "khetRakshakFarmer",
    JSON.stringify(data.farmer)
  );

  return data;
}

export function logoutFarmer() {
  localStorage.removeItem("khetRakshakToken");
  localStorage.removeItem("khetRakshakFarmer");
}

export function getStoredFarmer() {
  const farmer =
    localStorage.getItem("khetRakshakFarmer");

  return farmer ? JSON.parse(farmer) : null;
}

export function getStoredToken() {
  return localStorage.getItem("khetRakshakToken");
}