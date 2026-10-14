const express = require('express');
const app = express();

// Payload limit badha di hai taaki bada menu data error na de
app.use(express.json({ limit: '100mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

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

// 6. Shopify Order Webhook Endpoint & Petpooja Mapping
app.post('/shopify-order-webhook', (req, res) => {
    try {
        const shopifyOrder = req.body;
        console.log("Shopify Order Received ID:", shopifyOrder.id);

        // Petpooja restaurant ID aur format ke mutabiq order data map karna
        const petpoojaPayload = {
            restaurant_id: "3w51vcd6et",
            order_id: shopifyOrder.name,
            total_amount: shopifyOrder.total_price,
            customer_details: {
                name: shopifyOrder.customer ? `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim() : "Guest",
                phone: shopifyOrder.phone || shopifyOrder.customer?.phone || ""
            },
            items: shopifyOrder.line_items.map(item => ({
                item_code: item.sku || "",
                item_name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        console.log("Mapped Petpooja Payload:", JSON.stringify(petpoojaPayload));

        res.status(200).send("Order Received & Mapped Successfully");
    } catch (error) {
        console.error("Error processing order webhook:", error);
        res.status(500).send("Error processing webhook");
    }
});

module.exports = app;
