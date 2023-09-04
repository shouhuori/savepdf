const puppeteer = require('puppeteer')
 
async function printPDF() {
  const browser = await puppeteer.launch({ headless: false,args:['--window-size=374,800'] });
  
  const page = await browser.newPage();
  page.setViewport({width:374,height:800})
  page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1")
  let url = "https://mp.weixin.qq.com/s/ctHof7QFaob1baCdXSpbbw"
  await page.goto(url, {waitUntil: 'networkidle0'});

// page.waitForNavigation({
  
// })
 await page.pdf({
   width: '374',
   height:"800" ,
   path:"./test1.pdf",
   displayHeaderFooter:true
  });
 
  await browser.close();
}

printPDF()