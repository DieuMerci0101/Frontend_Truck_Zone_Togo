import api from "./api";

export interface ProfileUpdateData {
  nom_complet?: string;
  telephone?: string;
  date_naissance?: string;
  lieu_naissance?: string;
  adresse?: string;
  bio?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nom_complet: string;
  telephone: string;
  role: string;
  photo_profil: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  adresse: string | null;
  bio: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PhotoUploadResponse {
  photo_url: string;
  message: string;
  user: UserResponse;
}

export interface PhotoHistoryItem {
  id: string;
  file_path: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  is_active: boolean;
  created_at: string;
}

export const profileService = {
  getMe: () =>
    api.get<UserResponse>("/api/users/me").then((r) => r.data),

  updateProfile: (data: ProfileUpdateData) =>
    api.put<{ message: string; user: UserResponse }>("/api/users/me/profile", data).then((r) => r.data),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.put<PhotoUploadResponse>("/api/users/me/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  deletePhoto: () =>
    api.delete<{ message: string; user: UserResponse }>("/api/users/me/photo").then((r) => r.data),

  getPhotoHistory: () =>
    api.get<PhotoHistoryItem[]>("/api/users/me/photos").then((r) => r.data),
};
