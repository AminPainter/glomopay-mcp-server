import { config } from "@/features/app-config/app-config.module";
import { ApiClient } from "./api-client";

export const apiClient = new ApiClient({
  baseURL: `${config.glomopay.apiHost}/api/v1`,
  headers: {
    Authorization: `Bearer ${config.glomopay.apiSecret}`,
  },
});
