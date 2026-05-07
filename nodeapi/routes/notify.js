const express = require("express");
const router = express.Router();
const { sendNotification } = require("../config/socket");

// POST /api/notify/send
router.post("/send", (req, res) => {
    const { userId, title, message } = req.body;

    if (!userId || !message)
        return res.status(400).json({ error: "Missing fields" });

    const payload = {
        title,
        message,
        timestamp: new Date()
    };

    sendNotification(userId, payload);

    res.json({ success: true, deliveredTo: userId });
});

module.exports = router;
