// src/features/payment/paymentAPI.js
import axios from 'axios';

/**
 * bookingNumber로 예매 정보를 조회합니다.
 * @param {string} bookingNumber
 * @returns {Promise<AxiosResponse>}
 */
export function fetchBooking(bookingNumber) {
    return axios.get(`/api/bookings/${bookingNumber}`);
}
