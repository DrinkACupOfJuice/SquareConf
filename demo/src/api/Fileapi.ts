import axios from "axios";

const request = axios.create({
  baseURL: "http://127.0.0.1:4523/m1/7369421-7101291-default", // Mock 基础地址
  timeout: 10000,
});

/** 生成标准 UUID v4（替换 Mock 占位符） */
const generateRealUuid = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/** 上传文件响应类型定义 */
export interface UploadFileResponse {
  code: number;
  message: string;
  data: {
    file_id: string;
    url: string;
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
    const response = await request.post<{
      code: number;
      message: string;
      data: string;
    }>("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const rawData = JSON.parse(response.data.data);
    const realUuid = generateRealUuid();
    const parsedData = {
      file_id: rawData.file_id.replace("$uuid", realUuid),
      url: rawData.url.replace("$uuid", realUuid),
    };

    return {
      code: response.data.code,
      message: response.data.message.replace(/"/g, ""),
      data: parsedData,
    };
  } catch (error) {
    console.error("文件上传失败:", error);
    throw new Error(
      error.response?.data?.message || "上传失败，请检查服务是否正常或文件格式"
    );
  }
};


export const deleteFile = async (fileId: string): Promise<DeleteFileResponse> => {
  if (!fileId) throw new Error("文件 ID 不能为空");

  try {
    // 后端写接口写成了/files/<file_id>的逆天形式，这个<file_id>不是占位符，是字面量,我的意思就这么用吧
    const response = await request.delete<DeleteFileResponse>('/files/<file_id>', {
      params: { file_id: fileId },
    });

    return {
      code: response.data.code,
      message: response.data.message.replace(/"/g, ""),
    };
  } catch (error) {
    console.error(`删除文件 [${fileId}] 失败:`, error);
    throw new Error(
      error.response?.data?.message || `删除失败，请检查文件 ID 或接口配置`
    );
  }
};

export default request;