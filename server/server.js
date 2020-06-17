const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const compression = require('compression');
const loginRouter = require('./routers/login')
const roomRouter = require('./routers/room')
const cors = require('cors')

const PORT = process.env.PORT || 4000

app.use(bodyParser.json())
app.use(compression());
app.use(cors())

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
});

app.use('/', loginRouter)
app.use('/', roomRouter)

app.use((req, res, next) => {
    res.status(404).send('<h2>Not found : 404</h2>');
})

app.use((err, req, res, next) => {
    res.status(500).send('<h2>Internal Server Error : 500</h2>')
})

app.listen(PORT, () => {
    console.log(`Server On: maybe localhost:${PORT}`)
})