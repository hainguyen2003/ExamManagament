import api from "./api";

// Lấy danh sách tất cả người dùng
export async function getAllUsers() {
  const response = await api.get("/user");
  return response;
}

// Tạo người dùng mới
export async function createUserAPI(userData) {
  const response = await api.post("/user", userData);
  return response;
}
