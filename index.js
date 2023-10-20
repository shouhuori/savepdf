const puppeteer = require('puppeteer')
const Koa = require('koa')
const fs = require("fs")

const app = new Koa();

app.use(async ctx => {
  console.log(ctx.query)
  ctx.body = 'Hello World';
  if(ctx.query.url && ctx.query.w && ctx.query.h ){
   let res = await printPDF(ctx.query.url,ctx.query.w,ctx.query.h)
   const fileName = `${__dirname}/downloads/${res}.pdf`;
   if(res &&  fs.existsSync(fileName)){
      ctx.body = fs.createReadStream(fileName);
      ctx.attachment(fileName);
   }else{
        ctx.throw(500, "Requested file not found on server");
   }
  }else{
        ctx.throw(400, "is running");
  }
});


async function printPDF(url,w,h) {
  const browser = await puppeteer.launch({ headless: 'new',args:[`--window-size=${w},${h}`,'--no-sandbox', '--disable-setuid-sandbox'] });
  
  const page = await browser.newPage();
  page.setViewport({width:374,height:800})
  page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1")
  await page.goto(url, {waitUntil: 'networkidle0'});

  let pageTitle = await page.title()
// page.waitForNavigation({
  
// })
 await page.pdf({
   width: '374',
   height:"800" ,
   path:`./downloads/${pageTitle}.pdf`,
   displayHeaderFooter:true
  });
 
  await browser.close();
  return pageTitle
}

console.log('is running!');
app.listen(3000);
