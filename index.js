const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const shortcode = "8848834"; // Till number
const passkey = "YOUR_PASSKEY";
const businessName = "KENDAL";

const authUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const stkUrl = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

const timestamp = () => {
  const now = new Date();
  return now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0');
};

app.post('/pay', async (req, res) => {
  const { phone, amount } = req.body;
  const time = timestamp();
  const password = Buffer.from(shortcode + passkey + time).toString('base64');

  try {
    const { data } = await axios.get(authUrl, {
      auth: { username: consumerKey, password: consumerSecret }
    });

    const token = data.access_token;

    const response = await axios.post(
      stkUrl,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: time,
        TransactionType: "CustomerBuyGoodsOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: "https://mydomain.com/callback",
        AccountReference: "Payment",
        TransactionDesc: `Pay to ${businessName}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ success: true, message: "Payment initiated", response: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("M-Pesa STK Backend is running");
});

app.listen(port, () => console.log(`Server running on port ${port}`));