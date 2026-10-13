const express = require('express');
const app = express();

// Payload limit badha di hai taaki bada menu data error na de
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. Menu Push Endpoint
app.post('/api/petpooja/menu-push', (req, res) => {
    console.log("Petpooja Menu Received:", req.body);
    res.status(200).json({ status: "success", message: "Menu received" });
});

// 2. Get Store Status Endpoint
app.get('/api/petpooja/get-status', (req, res) => {
    res.status(200).json({ status: "success", store_status: 1 });
});

// 3. Update Store Status Endpoint
app.post('/api/petpooja/update-status', (req, res) => {
    res.status(200).json({ status: "success", message: "Status updated" });
});

// 4. Item Off Endpoint
app.post('/api/petpooja/item-off', (req, res) => {
    res.status(200).json({ status: "success", message: "Item turned off" });
});

// 5. Item On Endpoint
app.post('/api/petpooja/item-on', (req, res) => {
    res.status(200).json({ status: "success", message: "Item turned on" });
});

// 6. Shopify Order Webhook Endpoint
app.post('/shopify-order-webhook', (req, res) => {
    console.log("Shopify Order Received:", req.body);
    res.status(200).send("Order Received");
});

module.exports = app;
