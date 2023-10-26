const express = require("express");
const path = require("path");
const app = express();
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "/html/public/index.html"));
});

app.listen(3000);