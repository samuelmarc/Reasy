const express = require('express');
const path = require('path');

const port = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js/docx', express.static(path.join(__dirname, 'node_modules/docx/dist')));

app.listen(PORT, () => {
    console.log(`Server listening in port ${PORT}`);
});
