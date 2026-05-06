require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, Environment } = require('square');
const crypto = require('crypto');

const app = express();

// Use CORS to allow requests from the frontend. 
// If your frontend is on https://jarin.dev, you can restrict CORS to that origin in production.
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Initialize Square Client
// In production, ensure SQUARE_ENVIRONMENT is set to 'Production' and you use the Prod Access Token.
const squareClient = new Client({
    environment: process.env.SQUARE_ENVIRONMENT === 'Production' ? Environment.Production : Environment.Sandbox,
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

app.post('/process-payment', async (req, res) => {
    try {
        const { sourceId, amount, customerDetails, orderItems } = req.body;

        if (!sourceId || !amount) {
            return res.status(400).json({ success: false, error: "Missing required payment details." });
        }

        const paymentsApi = squareClient.paymentsApi;

        const paymentBody = {
            sourceId: sourceId,
            idempotencyKey: crypto.randomBytes(12).toString('hex'),
            amountMoney: {
                amount: amount, // Amount in cents
                currency: 'USD'
            },
            note: `Order for ${customerDetails?.name || 'Customer'}`
        };

        const { result } = await paymentsApi.createPayment(paymentBody);

        res.json({ success: true, payment: result.payment });
    } catch (error) {
        console.error("Square Payment Error:", error);

        let errorMessage = "An error occurred during payment processing.";
        if (error.errors && error.errors.length > 0) {
            errorMessage = error.errors[0].detail;
        }

        res.status(500).json({ success: false, error: errorMessage });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bread-site backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.SQUARE_ENVIRONMENT || 'Sandbox'}`);
});
