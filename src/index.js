require ('./database/connection')

const app = require('./app');

const port = app.get('port');

app.listen(port,() =>{
    console.log(`Servidor corriendo en http://localhost:${port}`);
});