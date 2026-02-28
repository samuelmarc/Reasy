const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

app.use(express.json());

router.get('/status', (req, res) => {
    res.json({ status: 'Online', projeto: 'Reasy' });
});

router.post('/exportar', (req, res) => {
    res.send("Arquivo gerado");
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);
