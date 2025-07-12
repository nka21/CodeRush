import { z } from "zod";

// APIベースURLの取得と検証
const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_API_BASE_URL is not defined",
    );
  }

  return baseUrl;
};

// 共通のAPI呼び出し関数
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit,
  responseSchema: z.ZodSchema<T>,
): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // デバッグ用: 実際のレスポンスを出力
    console.log("API Response:", JSON.stringify(data, null, 2));

    return responseSchema.parse(data);
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);

    // Zodエラーの場合、より詳細な情報を出力
    if (error instanceof z.ZodError) {
      console.error("Expected schema:", responseSchema);
      console.error("Validation errors:", error.issues);
    }

    throw error;
  }
};

// POST リクエスト専用のヘルパー関数
export const apiPost = async <T>(
  endpoint: string,
  body: unknown,
  responseSchema: z.ZodSchema<T>,
): Promise<T> => {
  return apiCall(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    responseSchema,
  );
};
