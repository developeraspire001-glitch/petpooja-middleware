const express = require('express');
const app = express();

app.use(express.json({ limit: '100mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.post('/api/petpooja/menu-push', (req, res) => {
    res.status(200).json({ status: "success", message: "Menu received" });
});

app.get('/api/petpooja/get-status', (req, res) => {
    res.status(200).json({ status: "success", store_status: 1 });
});

app.post('/api/petpooja/update-status', (req, res) => {
    res.status(200).json({ status: "success", message: "Status updated" });
});

app.post('/api/petpooja/item-off', (req, res) => {
    res.status(200).json({ status: "success", message: "Item turned off" });
});

app.post('/api/petpooja/item-on', (req, res) => {
    res.status(200).json({ status: "success", message: "Item turned on" });
});

// Shopify Webhook & Petpooja Save Order API Integration
app.post('/shopify-order-webhook', async (req, res) => {
    try {
        const shopifyOrder = req.body;
        console.log("Shopify Order Received ID:", shopifyOrder.id);

        const customerName = shopifyOrder.customer 
            ? `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim() 
            : "Guest Customer";

        const customerPhone = shopifyOrder.phone || shopifyOrder.customer?.phone || "9999999999";
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10) || "9999999999";

        // Petpooja API Payload Format
        const petpoojaPayload = {
            app_key: "rps3igv8ucfhydx0lao6k9obnz75tqw4",
            app_secret: "71b70724b84d8d8ca06fe9cc0da105b07c412228",
            access_token: "7337c1365cf2o6e1fe5f2b9f8d445db00dc6c39a1",
            OrderToPush: {
                Order: {
                    orderID: String(shopifyOrder.name || shopifyOrder.id),
                    restID: "3w51vcd6et",
                    order_type: "Delivery",
                    status: "1",
                    total: String(shopifyOrder.total_price || "0"),
                    subtotal: String(shopifyOrder.subtotal_price || shopifyOrder.total_price || "0"),
                    discount: String(shopifyOrder.total_discounts || "0"),
                    tax: String(shopifyOrder.total_tax || "0"),
                    packing_charges: "0",
                    delivery_charges: String(shopifyOrder.shipping_lines?.[0]?.price || "0"),
                    created_on: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    payment_type: shopifyOrder.financial_status === "paid" ? "Online" : "COD"
                },
                Customer: {
                    name: customerName || "Guest",
                    phone: cleanPhone,
                    email: shopifyOrder.email || "customer@example.com",
                    address: shopifyOrder.shipping_address?.address1 || "Local Address",
                    city: shopifyOrder.shipping_address?.city || "Kolkata",
                    state: shopifyOrder.shipping_address?.province || "West Bengal",
                    pincode: shopifyOrder.shipping_address?.zip || "700001"
                },
                OrderItem: shopifyOrder.line_items.map(item => ({
                    item_code: String(item.sku || ""),
                    item_name: String(item.name || ""),
                    quantity: String(item.quantity || 1),
                    price: String(item.price || 0),
                    total: String((parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2))
                }))
            }
        };

        console.log("Sending Payload to Petpooja:", JSON.stringify(petpoojaPayload));

        const petpoojaResponse = await fetch("https://47pfzh5sf2.execute-api.ap-southeast-1.amazonaws.com/V1/save_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(petpoojaPayload)
        });

        const result = await petpoojaResponse.json();
        console.log("Petpooja API Response:", result);

        res.status(200).send("Order Processed");
    } catch (error) {
        console.error("Error pushing order to Petpooja:", error);
        res.status(500).send("Error processing webhook");
    }
});

module.exports = app;
