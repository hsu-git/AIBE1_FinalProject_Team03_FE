import React from 'react';
import { Route } from 'react-router-dom';
import PaymentSuccess from '../../pages/payment/PaymentSuccess.jsx';
import PaymentFail from '../../pages/payment/PaymentFail.jsx';

export function PaymentRoutes() {
    return (
        <>
            <Route path="payment/result/success" element={<PaymentSuccess />} />
            <Route path="payment/result/fail" element={<PaymentFail />} />
        </>
    );
}
