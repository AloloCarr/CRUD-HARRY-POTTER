const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const cors = require('cors');

const characters = require('./routes/charactersRoutes');

//middleware
const morgan = require('morgan');

const app = express();

//configuracion
app.set('port', config.app.port)

// Middlewares 
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

//rutas
app.use('/api', characters);

//para ver si jala la api
app.get('/', (req, res ) =>{
    res.send('Harry Potter API OK!🧙✨')
})

module.exports = app;