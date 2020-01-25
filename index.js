const connection = require ('./db-config/databaseConfig');
const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res) => {
    res.json({'message':'Welcome'}); 
});

require('./api-routes/routes')(app);

connection.connect();

global.db = connection;

const port = 3000;
app.listen(port,() => {
    console.log("Server Running on port"+" "+port);
});