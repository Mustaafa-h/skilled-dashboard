import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== Auth =====================
export const login = async (email, password) => {
  return API.post('/auth/login', { email, password });
};

// ===================== Workers =====================
export const getCompanyWorkers = async (companyId, activeOnly = false) => {
  return API.get(`/companies/${companyId}/workers`, { params: { active_only: activeOnly } });
};
export const addCompanyWorker = async (companyId, workerData) => {
  return API.post(`/companies/${companyId}/workers`, workerData);
};
export const getCompanyWorkerById = async (workerId) => {
  return API.get(`/companies/workers/${workerId}`);
};
export const updateCompanyWorker = async (workerId, updatedData) => {
  return API.put(`/companies/workers/${workerId}`, updatedData);
};
export const deleteCompanyWorker = async (workerId) => {
  return API.delete(`/companies/workers/${workerId}`);
};

// ===================== Sub-Services =====================
export const getAllSubServices = async () => API.get('/sub-services');
export const getSubServiceById = async (subServiceId) => API.get(`/sub-services/${subServiceId}`);
export const addCompanySubService = async (companyId, serviceId, subServiceId) => {
  return API.post(`/companies/${companyId}/subservices`, { service_id: serviceId, subservice_id: subServiceId });
};
export const deleteSubService = async (subServiceId) => API.delete(`/sub-services/${subServiceId}`);
export const createSubService = async (subServiceData) => API.post("/sub-services", subServiceData);
export const updateSubService = async (subServiceId, subServiceData) => API.patch(`/sub-services/${subServiceId}`, subServiceData);
export const removeCompanySubService = async (companyId, subServiceId) => API.delete(`/companies/${companyId}/subservices/${subServiceId}`);

// ===================== Companies =====================
export const getAllCompanies = async () => API.get("/companies");
export const getCompany = async (companyId) => API.get(`/companies/${companyId}`);
export const createCompany = async (companyData) => API.post(`/companies`, companyData);
export const updateCompany = async (companyId, companyData) => API.put(`/companies/${companyId}`, companyData);
export const deleteCompany = async (companyId) => {
  try {
    await API.delete(`/companies/${companyId}`);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// ===================== Services =====================
export const createService = async (serviceData) => API.post("/services", serviceData);
export const getAllServices = async () => API.get('/services');
export const deleteService = async (serviceId) => API.delete(`/services/${serviceId}`);
export const getServiceById = async (serviceId) => API.get(`/services/${serviceId}`);
export const updateService = async (serviceId, data) => API.patch(`/services/${serviceId}`, data);
export const addCompanyService = async (companyId, serviceId, baseCost) => {
  return API.post(`/companies/${companyId}/services`, { service_id: serviceId, base_cost: baseCost });
};
export const removeCompanyService = async (companyId, serviceId) => API.delete(`/companies/${companyId}/services/${serviceId}`);

// ===================== Company Images =====================
export const addCompanyImage = async (companyId, imageData) => API.post(`/companies/${companyId}/images`, imageData);
export const getCompanyImages = async (companyId, type = "gallery") => API.get(`/companies/${companyId}/images`, { params: { type } });

// ===================== Company Preferences =====================
export const getCompanyPreferences = async (companyId) => API.get(`/company-preferences`, { params: { company_id: companyId } });
export const createCompanyPreference = async (preferenceData) => API.post(`/company-preferences`, preferenceData);
export const updateCompanyPreference = async (preferenceId, updatedData) => API.patch(`/company-preferences/${preferenceId}`, updatedData);
export const deleteCompanyPreference = async (preferenceId) => API.delete(`/company-preferences/${preferenceId}`);

// ===================== Preference Types =====================
export const getPreferenceTypes = async (serviceId) => API.get(`/preferences/types`, { params: { serviceId, isActive: true } });
export const getPreferenceTypesByServiceId = async (serviceId) => API.get(`/preferences/types`, { params: { serviceId } });
export const createPreferenceType = async (serviceId, data) => API.post(`/preferences/types`, { service_id: serviceId, ...data });
export const updatePreferenceType = async (preferenceTypeId, data) => API.patch(`/preferences/types/${preferenceTypeId}`, data);
export const deletePreferenceType = async (preferenceTypeId) => API.delete(`/preferences/types/${preferenceTypeId}`);
export const getPreferenceTypeById = async (prefTypeId) => {
  return API.get(`/preferences/types/${prefTypeId}`);
};

// ===================== Preference Options =====================
export const createPreferenceOption = async (preferenceTypeId, data) => API.post(`/preferences/options`, { preference_type_id: preferenceTypeId, ...data });
export const updatePreferenceOption = async (preferenceOptionId, data) => API.patch(`/preferences/options/${preferenceOptionId}`, data);
export const deletePreferenceOption = async (preferenceOptionId) => API.delete(`/preferences/options/${preferenceOptionId}`);
export const getPreferenceOptionById = async (optionId) => {
  return API.get(`/preferences/options/${optionId}`);
};

export default API;
