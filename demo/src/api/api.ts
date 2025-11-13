import axios from "axios";

const request = axios.create({
  baseURL: "http://127.0.0.1:4523/m1/7369421-7101291-default", // Mock 地址
  timeout: 5000,
});

// 上传文件接口
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return request.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 删除文件接口
export const deleteFile = (fileId: string) => {
  return request.delete(`/files/${fileId}`, {
    params: { file_id: fileId },
  });
};


