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

// 6. Shopify Order Webhook Endpoint & Petpooja Save Order API Integration
app.post('/shopify-order-webhook', async (req, res) => {
    try {
        const shopifyOrder = req.body;
        console.log("Shopify Order Received ID:", shopifyOrder.id);

        // Petpooja Save Order API ke format ke mutabiq payload aur aapki real keys
        const petpoojaPayload = {
            app_key: "rps3igv8ucfhydx0lao6k9obnz75tqw4",
            app_secret: "71b70724b84d8d8ca06fe9cc0da105b07c412228",
            access_token: "7337c1365cf2o6e1fe5f2b9f8d445db00dc6c39a1",
            restID: "3w51vcd6et",
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

        console.log("Sending Payload to Petpooja:", JSON.stringify(petpoojaPayload));

        // Petpooja Save Order API par POST request bhejna
        const petpoojaResponse = await fetch("https://47pfzh5sf2.execute-api.ap-southeast-1.amazonaws.com/V1/save_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(petpoojaPayload)
        });

        const result = await petpoojaResponse.json();
        console.log("Petpooja API Response:", result);

        res.status(200).send("Order Successfully Forwarded to Petpooja");
    } catch (error) {
        console.error("Error pushing order to Petpooja:", error);
        res.status(500).send("Error processing webhook");
    }
});

module.exports = app;
