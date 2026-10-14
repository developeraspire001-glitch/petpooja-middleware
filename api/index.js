const express = require('express');
const app = express();

app.use(express.json({ limit: '100mb', type: ['application/json', 'text/plain'] }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 1. Menu Push Endpoint
app.post('/api/petpooja/menu-push', (req, res) => {
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

// 6. Shopify Webhook Endpoint -> Petpooja Save Order API V2.1
app.post('/shopify-order-webhook', async (req, res) => {
    try {
        const shopifyOrder = req.body;
        console.log("Shopify Order Received ID:", shopifyOrder.id);

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        const customerName = shopifyOrder.customer 
            ? `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim() 
            : "Guest Customer";

        const rawPhone = shopifyOrder.phone || shopifyOrder.customer?.phone || shopifyOrder.shipping_address?.phone || "9999999999";
        const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10) || "9999999999";

        // Petpooja Save Order API exact schema format
        const petpoojaPayload = {
            app_key: "rps3igv8ucfhydx0lao6k9obnz75tqw4",
            app_secret: "71b70724b84d8d8ca06fe9cc0da105b07c412228",
            access_token: "7337c1365cf2o6e1fe5f2b9f8d445db00dc6c39a1",
            orderinfo: {
                OrderInfo: {
                    Restaurant: {
                        details: {
                            res_name: "Cremevora DEMO",
                            address: "Kolkata",
                            contact_information: "9999999999",
                            restID: "3w51vcd6et"
                        }
                    },
                    Customer: {
                        details: {
                            email: shopifyOrder.email || "customer@example.com",
                            name: customerName || "Guest",
                            address: shopifyOrder.shipping_address?.address1 || "Local Address",
                            phone: cleanPhone,
                            latitude: "",
                            longitude: ""
                        }
                    },
                    Order: {
                        details: {
                            orderID: String(shopifyOrder.name || shopifyOrder.id),
                            preorder_date: currentDate,
                            preorder_time: currentTime,
                            service_charge: "0",
                            sc_tax_amount: "0",
                            delivery_charges: String(shopifyOrder.shipping_lines?.[0]?.price || "0"),
                            dc_tax_percentage: "0",
                            dc_tax_amount: "0",
                            dc_gst_details: [],
                            packing_charges: "0",
                            pc_tax_amount: "0",
                            pc_tax_percentage: "0",
                            pc_gst_details: [],
                            order_type: "H",
                            ondc_bap: "",
                            advanced_order: "N",
                            urgent_order: false,
                            urgent_time: 20,
                            payment_type: shopifyOrder.financial_status === "paid" ? "ONLINE" : "COD",
                            table_no: "",
                            no_of_persons: "0",
                            discount_total: String(shopifyOrder.total_discounts || "0"),
                            tax_total: String(shopifyOrder.total_tax || "0"),
                            discount_type: "F",
                            total: String(shopifyOrder.total_price || "0"),
                            description: shopifyOrder.note || "",
                            created_on: `${currentDate} ${currentTime}`,
                            enable_delivery: 1,
                            min_prep_time: 20,
                            callback_url: "",
                            collect_cash: shopifyOrder.financial_status === "paid" ? "0" : String(shopifyOrder.total_price || "0"),
                            otp: ""
                        }
                    },
                    OrderItem: {
                        details: shopifyOrder.line_items.map(item => ({
                            id: String(item.sku || "148"),
                            name: String(item.name || "Item"),
                            tax_inclusive: true,
                            gst_liability: "restaurant",
                            item_tax: [],
                            item_discount: String(item.total_discount || "0"),
                            price: parseFloat(item.price || 0).toFixed(2),
                            final_price: parseFloat(item.price || 0).toFixed(2),
                            quantity: String(item.quantity || 1),
                            description: "",
                            variation_name: "",
                            variation_id: "",
                            AddonItem: {
                                details: []
                            }
                        }))
                    },
                    Tax: {
                        details: []
                    },
                    Discount: {
                        details: []
                    }
                },
                udid: "",
                device_type: "Web"
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

        res.status(200).json({ status: "success", petpooja_response: result });
    } catch (error) {
        console.error("Error pushing order to Petpooja:", error);
        res.status(500).send("Error processing webhook");
    }
});

module.exports = app;
