"use server";

import axios, { AxiosError } from "axios";

export async function uploadImagesToKiri(formData: FormData) {
  const API_KEY = process.env.KIRI_API_KEY;
  try {
    const response = await axios.post(
      "https://api.kiriengine.app/api/v1/open/3dgs/image",
      formData,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return { success: true, data: response.data.data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof AxiosError
        ? error?.response?.data?.msg
        : error instanceof Error
        ? error.message
        : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getModelStatus(serialize: string) {
  const API_KEY = process.env.KIRI_API_KEY;

  try {
    const response = await axios.get(
      `https://api.kiriengine.app/api/v1/open/model/getStatus?serialize=${serialize}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return { success: true, data: response.data.data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getModelZip(serialize: string) {
  const API_KEY = process.env.KIRI_API_KEY;

  try {
    const response = await axios.get(
      `https://api.kiriengine.app/api/v1/open/model/getModelZip?serialize=${serialize}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    return { success: true, data: response.data.data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
