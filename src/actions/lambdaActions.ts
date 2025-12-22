"use server";

import axios from "axios";

const LAMBDA_URL =
  "https://by6oy6pubv7yeppnm7fau42uam0geivb.lambda-url.us-east-2.on.aws/";

export async function convertPlyWithLambda(s3_url: string) {
  try {
    const response = await axios.post(LAMBDA_URL, {
      s3_url,
    });

    if (response.data && response.data) {
      return { success: true, data: response.data };
    } else {
      throw new Error("Invalid response from Lambda function");
    }
  } catch (error: unknown) {
    console.log(
      "Error calling Lambda function:",
      axios.isAxiosError(error) ? error.response?.data?.error : error
    );
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.error || error.message
      : error instanceof Error
      ? error.message
      : "An unknown error occurred";
    console.error("Lambda conversion error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
