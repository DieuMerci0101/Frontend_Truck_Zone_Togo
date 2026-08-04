import api from "./api";
import type { Country } from "@/types";

export const countryService = {
  getCountries: () =>
    api.get<Country[]>("/api/countries").then((r) => r.data),
};
