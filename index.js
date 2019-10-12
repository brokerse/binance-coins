const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer');

const downloadImage = (url, filename) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(`./images/${filename}.png`))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    );

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://info.binance.com/en/all');

    const tdList = await page.evaluate(() => Array
        .from(document.querySelectorAll('table tr td'))
        .map(td => td.innerHTML)
    )

    tdList.forEach(async (element) => {
        if (!element.includes(`<div class="s7v36e6-0 iilQaX">`)) return

        const url = element
            .split(`<div class="s7v36e6-0 iilQaX"><img class="avatar" alt="" src="`)
            .pop()
            .split(`"><div class="name"><span class="abbr">`)[0]

        const coin = element
            .split(`"><div class="name"><span class="abbr">`)
            .pop()
            .split(`</span><span class="fullName">`)[0]

        downloadImage(url, coin)
    });

    await browser.close();
})();