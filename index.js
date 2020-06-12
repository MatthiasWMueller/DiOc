const express = require('express');

const app = express();
// middleware

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST', 'PUT');
        return res.status(200).json({});
    }
    next(); 
});
app.use(express.json());       
app.use(express.urlencoded()); 


app.get('/', async (req, res) => {
    res.send("hallo")
})




const port = process.env.PORT || 5100;
app.listen(port, () => console.log("running!!"));
