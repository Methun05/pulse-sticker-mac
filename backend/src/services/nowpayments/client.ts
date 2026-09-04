import axios, { AxiosInstance } from "axios";
import { config } from "../../config";
import { CreatePaymentRequest, CreatePaymentResponse } from "./types";

const NOWPAYMENTS_BASE_URL = "https://api.nowpayments.io/v1";

function buildClient(): AxiosInstance {
  return axios.create({
    baseURL: NOWPAYMENTS_BASE_URL,
    headers: {
      "x-api-key": config.nowPayments.apiKey,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

const httpClient = buildClient();

/**
 * Creates a payment (invoice) via NOWPayments. Throws on any non-2xx
 * response or network error — callers are expected to catch and translate
 * to an HTTP error for our own API consumers.
 */
export async function createPayment(
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await httpClient.post<CreatePaymentResponse>(
    "/payment",
    request
  );
  return response.data;
}
