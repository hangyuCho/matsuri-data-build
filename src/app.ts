
//import PUPPETEER from "puppeteer"
const PUPPETEER = require("puppeteer");

const init = async () => {
  let browser = await PUPPETEER.launch({
    headless: false,
    slowMo: 50,
    //args: ["--window-size-1920,1000"],
  });

  let page = await browser.newPage();
  return page;
};

const delay:number = 3000 

const buildData = async (page: any) => {
  for(let idx of [1,2,3,4,5,6,7,8,9,10]) {
    await page.goto(`https://www.walkerplus.com/event_list/ar0300/eg0135/${idx}.html`);

    await page.waitForTimeout(delay);

    const matsuriLink = await page.$$('.m-mainlist-item > a');
    const el1 = await Promise.all(
      matsuriLink.map((h: any)=> h.getProperty("href"))
    )
    const hrefArray = await Promise.all(
      el1.map((h:any) => h.jsonValue())
    )

    for(let href of hrefArray) {
      await page.goto(`${href}`);

      await page.waitForTimeout(delay);

      await page.goto(`${page.url()}data.html`);
      
      await page.waitForTimeout(delay);
      
      const labelCol = await page.$$('td.m-infotable__th');
      const dataCol = await page.$$('td.m-infotable__td');
      let result:any = {}
      for (let i=0; i < labelCol.length; i++) {
        let label:any = await labelCol[i].evaluate((x:any) => x.textContent.replace(/\\n|\s+|/g, ""))
        let value:any = await dataCol[i].evaluate((x:any) => x.textContent.replace(/\\n|\s+|\[地図\]/g, ""))
        console.log("data : ", label,value)
        result[label] = value
      }
      console.log(result)

      await page.goBack();
      await page.waitForTimeout(delay);

      await page.goBack();
      await page.waitForTimeout(delay);
    }

  }
}



const main = async () => {

  let page = await init();
  try {
    await buildData(page);

  } catch (e: any) {
    console.error(`Error : ${e}`);
  }
  await page.close();
};

main();
