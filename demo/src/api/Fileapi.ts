import axios from "axios";

const request = axios.create({
  baseURL: "http://127.0.0.1:4523/m1/7369421-7101291-default", // Mock 基础地址
  timeout: 10000,
});

/** 上传文件响应类型定义 */
export interface UploadFileResponse {
  code: number;
  message: string;
  data: {
    file_id: string;
    url?: string; // 当前接口没有 url，可选
  };
}

/** 删除文件响应类型定义 */
export interface DeleteFileResponse {
  code: number;
  message: string;
}

/** 上传文件接口 */
export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
  if (!file) throw new Error("请选择要上传的文件");
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await request.post<UploadFileResponse>("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      code: response.data.code,
      message: response.data.message.replace(/"/g, ""),
      data: {
        file_id: response.data.data.file_id,
        // url 可选
      },
    };
  } catch (error: any) {
    console.error("文件上传失败:", error);
    throw new Error(
      error.response?.data?.message || "上传失败，请检查服务是否正常或文件格式"
    );
  }
};

/** 删除文件接口 */
export const deleteFile = async (fileId: string): Promise<DeleteFileResponse> => {
  if (!fileId) throw new Error("文件 ID 不能为空");
  try {
    // 保留原 /files/<file_id> 调用形式
    const response = await request.delete<DeleteFileResponse>(`/files/${fileId}`);

    return {
      code: response.data.code,
      message: response.data.message.replace(/"/g, ""),
    };
  } catch (error: any) {
    console.error(`删除文件 [${fileId}] 失败:`, error);
    throw new Error(
      error.response?.data?.message || `删除失败，请检查文件 ID 或接口配置`
    );
  }
};

export default request;