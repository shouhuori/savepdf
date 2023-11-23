import puppeteer from "puppeteer";
import Koa from "koa";
import fs from "fs";
import { extract } from "@extractus/article-extractor";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';

// 测试下载地址
// http://localhost:3000/?url=https://www.authing.com/blog/633&w=375&h=800&view=reader

const app = new Koa();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);
app.use(async (ctx) => {
  console.log(ctx.query);
  ctx.body = "Hello World";
  if (ctx.query.url && ctx.query.w && ctx.query.h) {
    let res = await printPDF(
      ctx.query.url,
      ctx.query.w,
      ctx.query.h,
      ctx.query.view
    );
    const fileName = `${__dirname}/downloads/${res}.pdf`;
    if (res && fs.existsSync(fileName)) {
      ctx.body = fs.createReadStream(fileName);
      ctx.attachment(fileName);
    } else {
      ctx.throw(500, "Requested file not found on server");
    }
  } else {
    ctx.throw(400, "is running");
  }
});

/**
 * 打印PDF
 */
async function printPDF(url, w, h, view) {
  if (view === "reader") {
    try {
      const article = await extract(url);
      if(!article){
        return '暂不支持'
      }
      const htmlName = uuidv4()+'.html'
      saveHtml(article,htmlName)
      url = `file://${__dirname}/readerHtml/html/${htmlName}`;
    } catch (err) {
      console.error(err);
    }
  }

  console.log(view);
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      `--window-size=${w},${h}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();
  page.setViewport({ width: 374, height: 800 });
  page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
  );
  await page.goto(url, { waitUntil: "networkidle0" });

  let pageTitle = await page.title();
  // page.waitForNavigation({

  // })
  await page.pdf({
    width: "374",
    height: "800",
    path: `./downloads/${pageTitle}.pdf`,
    displayHeaderFooter: false,
    // headerTemplate: '<div style="font-size:16px;width:100%;text-align:center;">HEADER</div>',
    // footerTemplate: '<div style="font-size:16px;width:100%;text-align:center;">FOOTER</div>',
    margin:{
      top: '30px',
      bottom: '30px',
      right: 0,
      left: 0,
    }
  });

  await browser.close();
  return pageTitle;
}

/**
 * 
 */
function saveHtml(article,htmlName) {
  const html = `
  <!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,height=device-height,initial-scale=1.0,user-scalable=no,minimum-scale=1.0,maximum-scale=1.0"/>
    <title>${article.title}</title>
    <link rel="stylesheet" href="../bulma.min.css">
  </head>
  <body>
  <section class="section">
    <div class="container">
      <h1 class="title">
        ${article.title}
      </h1>
      <p class="subtitle">
      ${article.author}
      ${article.url}
      ${article.description}
      </p>
      <div class="content">

      ${article.content}
      </div>
      </div>  
      </section>
    </body
  `;

  fs.writeFile(
    `${__dirname}/readerHtml/html/${htmlName}`,
    html,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}

console.log("is running!");
app.listen(3000);
