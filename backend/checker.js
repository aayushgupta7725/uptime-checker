const axios = require('axios')
const cron = require('node-cron')
const db = require('./database');


function checkUrl(urlRecord) {
    const start = Date.now()

    axios.get(urlRecord.url)
    .then((response) => {
        const responseTime = Date.now() - start;
        const status = response.status === 200? "up" :"down";

        db.prepare("INSERT INTO checks (url_id, status, response_time) VALUES (?,?,?)").run(urlRecord.id, status, responseTime);
        console.log(`✅ ${urlRecord.url} is ${status} - ${responseTime}ms`);
    })

    .catch(() => {
        const responseTime = Date.now() - start;
    
        db.prepare("INSERT INTO checks(url_id, status, response_time) VALUES (?,?,?)").run(urlRecord.id, "down", responseTime);
        console.log(`❌ ${urlRecord.url} is down - ${responseTime}ms`);
    })
}

function startChecker() {
    cron.schedule('* * * * *', () => {
        const urls = db.prepare("SELECT * FROM urls").all();
        urls.forEach((urlRecord) =>{
            const now = new Date().getMinutes();
            if( now % urlRecord.interval === 0){
                checkUrl(urlRecord);
            }

        })
    });
    console.log("Checker started");
}

module.exports = { startChecker };