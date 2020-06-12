const express = require('express');
const DomParser = require('dom-parser');
const puppeteer = require('puppeteer');
var request = require('request');


///////////////////////////
// digital ocean 
///////////////////////////

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

let userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:53.0) Gecko/20100101 Firefox/53.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
    "Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12H321 Safari/600.1.4",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1",
    "curl/7.35.0",
//       "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
]
let locations = ["eu", "na"]

app.post('/getPrice_zen', async (req, res) => {           // result: undefined ????
    const url = decodeURIComponent(req.body.url)
    var location = locations[Math.floor(Math.random() * locations.length)];
    const key = "2e4a0950-ab24-11ea-9bcd-4d4684ddfa61"
    try {
        var options = { 
            url: 'https://app.zenscrape.com/api/v1/get?apikey=' + key +  '&url=' + url + '&location=' + location
        };
        // &render=true&premium=true
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
            //    console.log(body);
                const parser = new DomParser()
                const dom = parser.parseFromString(body)
                const price = getPrice(dom)
                const result = {
                    price: price,
                } 
                res.send(JSON.stringify(result))
                console.log(price);
            } else {
                res.send("blocked")
            }
        }
        request(options, callback);
    } catch (error) {
        res.send("error")
    }
})

app.post('/getPrice', async (req, res) => {            
    const url = decodeURIComponent(req.body.url)
    var agent = userAgents[Math.floor(Math.random() * userAgents.length)];
    try {
        (async () => {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'
            , '--disable-setuid-sandbox'
            , '--user-agent=${agent}'
            ] } );
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle0' });
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);
            const parser = new DomParser()
            const dom = parser.parseFromString(bodyHTML)			
			const price = getPrice(dom)
			const result = {
				price: price,
			} 
            await browser.close();
            res.send(JSON.stringify(result))
          })();      
    } catch (error) {
        const result = {
            title: "error",
        } 
        res.send(JSON.stringify(result))
    }
})



app.post('/getInfo', async (req, res) => {
    const url = decodeURIComponent(req.body.url)
    var agent = userAgents[Math.floor(Math.random() * userAgents.length)];
    try {
        (async () => {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'
            , '--disable-setuid-sandbox'
            , '--user-agent=${agent}'
            ] } );
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle0' });
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);
            const parser = new DomParser()
            const dom = parser.parseFromString(bodyHTML)
			
			const title = getTitle(dom)
			const price = getPrice(dom)
			const imageURL = getImageUrl(dom)	
			const result = {
				title: title,
				price: price,
				imageURL: imageURL
			} 
            await browser.close();
            res.send(JSON.stringify(result))
          })();      
    } catch (error) {
        const result = {
            title: "error",
            price: "error",
            imageURL: "error"
        } 
        res.send(JSON.stringify(result))
    }
})





app.post('/test', async (req, res) => {
    const url = decodeURIComponent(req.body.url)
    var agent = userAgents[Math.floor(Math.random() * userAgents.length)];
    try {
        (async () => {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'
            , '--disable-setuid-sandbox'
            , '--user-agent=${agent}'
            ] } );
            await browser.newPage()
            .then(async page => {
                await page.goto(url, { waitUntil: 'networkidle0' })
                .then( async () => {
                    await page.evaluate(() => document.body.innerHTML)
                    .then(async bodyHTML => {
                        const parser = new DomParser()
                        const dom = parser.parseFromString(bodyHTML)
                        const title = getTitle(dom)
                        const price = getPrice(dom)
                        const imageURL = getImageUrl(dom)	
                        return {
                            title: title,
                            price: price,
                            imageURL: imageURL
                        }  
                    })
                    .then(async result => {
                        res.send(JSON.stringify(result))
                        await browser.close();
                    })
                    .catch(error => console.log("error"))
                }
                    
                )
                .catch(error => console.log("error"))
            })
            .catch(error => console.log("error"))
            
        
                
            
          })();    
    } catch (error) {
        const result = {
            title: "error",
            price: "error",
            imageURL: "error"
        } 
        res.send(JSON.stringify(result))
    }
})
//////////////////// functions



const getTitle = (dom) => {
    const titleRaw = dom.getElementById('productTitle').innerHTML
    return titleRaw.trim()
}
const getPrice = (dom) => {
    const prices = dom.getElementsByClassName('offer-price')
    const buyboxprice = dom.getElementById('price_inside_buybox')
    if(buyboxprice){
        tmp = buyboxprice.innerHTML.replace(",", ".")
        return parseFloat(tmp.substr(0, tmp.length - 2))
    } 
    else if(prices){
        if(prices.length > 0){
            tmp = prices[0].innerHTML.replace(",", ".")
            return parseFloat(tmp.substr(0, tmp.length - 2))
        }
    }
}


const getImageUrl = (dom) => {
    const imgTarget_1 = dom.getElementById('img-canvas')
    const imgTarget_2 = dom.getElementById('imgTagWrapperId')
    const imgTarget_3 = dom.getElementById('altImages')
    const imgTarget_4 = dom.getElementsByClassName('imgTagWrapper')
    if(imgTarget_1){
        res = getIMG_1(imgTarget_1) 
        if(res){
            return res
        }               
    }
    if(imgTarget_2){
        res = getIMG_2(imgTarget_2.length)
        if(res){
            return res
        }
    }
    if(imgTarget_3){
        res = getIMG_3(imgTarget_3)
        if(res){
            return res
        }
    }
    if(imgTarget_4){
        res = getIMG_4(imgTarget_4)
        if(res){
            return res
        }
    }
}

const getIMG_1 = (target) => {
    imageSRC = target.getElementsByTagName("img")[0].getAttribute("data-a-dynamic-image") 
    return imageSRC.split("&quot;")[1]
}

const getIMG_2 = (target) => {
    try {
        imageSRC = target.getElementsByTagName("img")
        if(imageSRC.length > 0){
            srcAtt = imageSRC[0].getAttribute("src")
            return imageSRC
        }
    } catch (error) {
        
    }
}

const getIMG_3 = (target) => {
    imgTags = target.getElementsByTagName("img")
    if(imgTags.length > 0){
        refLink = imgTags[0].getAttribute("src") 
        return refLink
    }
}

const getIMG_4 = (target) => {
    if(target.length > 0){
        const imgTags = target[0].getElementsByTagName("img");
        if(imgTags.length > 0){
            refLink = imgTags[0].getAttribute("src")
            if (startsWith(refLink, "http")){
                return refLink
            }
        }  
    }
}












function startsWith(str, word) {
    return str.lastIndexOf(word, 0) === 0;
}












const port = process.env.PORT || 5100;
app.listen(port, () => console.log("running!!"));
