import { get, post } from "../api/client";

export const addReport = (report) => {
  return post("/api/reports/add", report);
};

export const getAllReports = () => {
  return get("/api/reports/all");
};
