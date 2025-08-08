import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const BOOKINGS_BASE = process.env.NEXT_PUBLIC_BOOKINGS_API_URL || "http://ec2-3-68-193-86.eu-central-1.compute.amazonaws.com:3003/api/v1";

const API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const JSON_API = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

JSON_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const withCatch = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

const BOOKINGS_API = axios.create({
  baseURL: BOOKINGS_BASE,
  headers: {
    "Content-Type": "application/json",
    "Accept": "*/*"  
  },
});

BOOKINGS_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== Auth =====================



export const login = async (email, password) =>
  withCatch(() => API.post("/auth/login", { email, password }));

// ===================== Workers =====================
export const getCompanyWorkers = async (companyId, activeOnly = false) =>
  withCatch(() => API.get(`/companies/${companyId}/workers`, { params: { active_only: activeOnly } }));

export const addCompanyWorker = async (companyId, workerData) =>
  withCatch(() => API.post(`/companies/${companyId}/workers`, workerData));

export const getCompanyWorkerById = async (workerId) =>
  withCatch(() => API.get(`/companies/workers/${workerId}`));

export const updateCompanyWorker = async (workerId, updatedData) =>
  withCatch(() => API.put(`/companies/workers/${workerId}`, updatedData));

export const deleteCompanyWorker = async (workerId) =>
  withCatch(() => API.delete(`/companies/workers/${workerId}`));

// ===================== Sub-Services =====================
export const getAllSubServices = async () => withCatch(() => API.get("/sub-services"));
export const getSubServiceById = async (subServiceId) => withCatch(() => API.get(`/sub-services/${subServiceId}`));
export const addCompanySubService = async (companyId, serviceId, subServiceId) =>
  withCatch(() => JSON_API.post(`/companies/${companyId}/subservices`, { service_id: serviceId, subservice_id: subServiceId }));

export const deleteSubService = async (subServiceId) => withCatch(() => API.delete(`/sub-services/${subServiceId}`));
export const createSubService = async (subServiceData) => withCatch(() => API.post("/sub-services", subServiceData));
export const updateSubService = async (subServiceId, subServiceData) =>
  withCatch(() => API.patch(`/sub-services/${subServiceId}`, subServiceData));

export const removeCompanySubService = async (companyId, subServiceId) =>
  withCatch(() => API.delete(`/companies/${companyId}/subservices/${subServiceId}`));

// ===================== Companies =====================
export const getAllCompanies = async () => withCatch(() => API.get("/companies"));
export const getCompany = async (companyId) => withCatch(() => API.get(`/companies/${companyId}`));
export const createCompany = async (companyData) => withCatch(() => API.post("/companies", companyData));
export const updateCompany = async (companyId, companyData) =>
  withCatch(() => API.put(`/companies/${companyId}`, companyData));

export const deleteCompany = async (companyId) =>
  withCatch(() => API.delete(`/companies/${companyId}`).then(() => ({ success: true })));

// ===================== Services =====================
export const createService = async (serviceData) => withCatch(() => API.post("/services", serviceData));
export const getAllServices = async () => withCatch(() => API.get("/services"));
export const deleteService = async (serviceId) => withCatch(() => API.delete(`/services/${serviceId}`));
export const getServiceById = async (serviceId) => withCatch(() => JSON_API.get(`/services/${serviceId}`));
export const updateService = async (serviceId, data) => withCatch(() => API.patch(`/services/${serviceId}`, data));

export const addCompanyService = async (companyId, serviceId, baseCost) =>
  withCatch(() => JSON_API.post(`/companies/${companyId}/services`, { service_id: serviceId, base_cost: baseCost }));

export const removeCompanyService = async (companyId, serviceId) =>
  withCatch(() => JSON_API.delete(`/companies/${companyId}/services/${serviceId}`));

// ===================== Company Images =====================
export const addCompanyImage = async (companyId, imageData) =>
  withCatch(() => API.post(`/companies/${companyId}/images`, imageData));

export const getCompanyImages = async (companyId, type = "gallery") =>
  withCatch(() => API.get(`/companies/${companyId}/images`, { params: { type } }));

export const deleteCompanyImage = async (imageId) =>
  API.delete(`/companies/images/${imageId}`);


// ===================== Company Preferences =====================
export const getCompanyPreferences = async (companyId) =>
  withCatch(() => JSON_API.get(`/company-preferences`, { params: { company_id: companyId } }));

export const createCompanyPreference = async (preferenceData) =>
  withCatch(() => JSON_API.post(`/company-preferences`, preferenceData));

export const updateCompanyPreference = async (preferenceId, updatedData) =>
  withCatch(() => JSON_API.patch(`/company-preferences/${preferenceId}`, updatedData));

export const deleteCompanyPreference = async (preferenceId) =>
  withCatch(() => JSON_API.delete(`/company-preferences/${preferenceId}`));

// ===================== Preference Types =====================
export const getPreferenceTypes = async (serviceId) =>
  withCatch(() => JSON_API.get(`/preferences/types`, { params: { serviceId, isActive: true } }));

export const getPreferenceTypesByServiceId = async (serviceId) =>
  withCatch(() => JSON_API.get(`/preferences/types`, { params: { serviceId } }));

export const createPreferenceType = async (data) =>
  withCatch(() => JSON_API.post(`/preferences/types`, data));

export const updatePreferenceType = async (preferenceTypeId, data) =>
  withCatch(() => JSON_API.patch(`/preferences/types/${preferenceTypeId}`, data));

export const deletePreferenceType = async (preferenceTypeId) =>
  withCatch(() => JSON_API.delete(`/preferences/types/${preferenceTypeId}`));

export const getPreferenceTypeById = async (prefTypeId) =>
  withCatch(() => JSON_API.get(`/preferences/types/${prefTypeId}`));

// ===================== Preference Options =====================
export const createPreferenceOption = async (payload) =>
  withCatch(() => JSON_API.post("/preferences/options", payload));

export const updatePreferenceOption = async (preferenceOptionId, data) =>
  withCatch(() => JSON_API.patch(`/preferences/options/${preferenceOptionId}`, data));

export const deletePreferenceOption = async (preferenceOptionId) =>
  withCatch(() => JSON_API.delete(`/preferences/options/${preferenceOptionId}`));

export const getPreferenceOptionById = async (optionId) =>
  withCatch(() => JSON_API.get(`/preferences/options/${optionId}`));

// ===================== Bookings =====================
export const getCompanyBookings = async () => {
  try {
    const res = await BOOKINGS_API.get("/bookings");
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch bookings:", err);
    throw new Error("Failed to fetch bookings");
  }
};


export const updateBookingStatus = async (id, data) =>
  withCatch(() => BOOKINGS_API.put(`/bookings/${id}/status`, data));

export const assignWorkerToBooking = async (id, data) =>
  withCatch(() => BOOKINGS_API.put(`/bookings/${id}/assign-worker`, data));

export const markCashAsPaid = async (id) =>
  withCatch(() => BOOKINGS_API.put(`/bookings/${id}/mark-cash-paid`));

export const updatePaymentStatus = async (id, data) =>
  withCatch(() => BOOKINGS_API.put(`/bookings/${id}/payment-status`, data));

// ===================== Banners =====================

// Get all banners
export const getAllBanners = async () => withCatch(() => API.get("/banners"));

// Create banner (with image)
export const createBanner = async (formData) =>
  withCatch(() =>
    API.post("/banners", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// Update banner (image and name)
export const updateBanner = async (bannerId, formData) =>
  withCatch(() =>
    API.put(`/banners/${bannerId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// Toggle active status
export const toggleBannerActive = async (bannerId) =>
  withCatch(() => API.put(`/banners/${bannerId}/toggle-active`));


export const deleteBanner = async (bannerId) =>
  withCatch(() => API.delete(`/banners/${bannerId}`));

//=================admins==========================

export const getAdmins = () =>
   withCatch(() => JSON_API.get("auth/getUsers"));

export const registerAdmin = async(superFormData) =>
   withCatch(() => JSON_API.post("auth/register-admin", superFormData));

export const registerCompanyAdmin = async(formData) =>
   withCatch(() => JSON_API.post("auth/register-company-admin",formData));

export const resetAdminsPassword = async(formData) =>
   withCatch(() => JSON_API.post("auth/reset-password-admins",formData));


//=================notifications===================
export const pushFcmAndFid = async(deviceId, fcmToken) =>
   withCatch(() => JSON_API.post("auth/devices",{deviceId, fcmToken}));

export const getDevice = async() =>
   withCatch(() => JSON_API.get("auth/devices"));

export default API;


// ================ chat endpoints ============================================

/**
 * Fetch list of chat rooms for the current user.
 * GET /api/v1/chat/rooms
 */
export const getChatRooms = () =>
  withCatch(() => JSON_API.get("chat/rooms"));

/**
 * Fetch paginated messages for a specific chat room.
 * GET /api/v1/chat/rooms/{roomId}/messages?page={page}&limit={limit}
 *
 * @param {string} roomId
 * @param {number} [page=1]
 * @param {number} [limit=50]
 */

export const getChatMessages = (roomId, page = 1, limit = 50) =>
  withCatch(() =>
    JSON_API.get(`chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`)
  );


// ================ end chat endpoints ========================================