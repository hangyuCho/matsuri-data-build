
//import PUPPETEER from "puppeteer"
//
import { writeFile } from 'fs/promises';
import * as path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import puppeteer from "puppeteer"
import cliProgress from "cli-progress"

//const PUPPETEER = require("puppeteer");

const init = async () => {
  let browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    //args: ["--window-size-1920,1000"],
  });

  let page = await browser.newPage();
  return page;
};

const delay:number = 500 

const buildData = async (page: any) => {
  const resultList: any[] = []

  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: " {bar} | {itemName} | {value}/{total}",
  }, cliProgress.Presets.shades_classic);
  const pageBar = multibar.create(10, 0);
  pageBar.update(0, {itemName: "Total Page       "})

  for(let idx of [1,2,3,4,5,6,7,8,9,10]) {
    pageBar.increment();
    await page.goto(`https://www.walkerplus.com/event_list/ar0300/eg0135/${idx}.html`);

    await page.waitForTimeout(delay);

    const matsuriLink = await page.$$('.m-mainlist-item > a');
    const el1 = await Promise.all(
      matsuriLink.map((h: any)=> h.getProperty("href"))
    )
    const hrefArray = await Promise.all(
      el1.map((h:any) => h.jsonValue())
    )

    let rowBar = multibar.create(hrefArray.length, 0);
    rowBar.update(0, {itemName: `Per row in Page${String(idx).padStart(2, "0")}`})
    for(let href of hrefArray) {
      rowBar.increment()
      await page.goto(`${href}`);

      await page.waitForTimeout(delay);

      await page.goto(`${page.url()}data.html`);
      
      await page.waitForTimeout(delay);
      
      const labelCols = await page.$$('th.m-infotable__th');
      const dataCols = await page.$$('td.m-infotable__td');
      let result:any = {}
      let i = -1;
      // console.log(" label Qty : ", labelCols.length)
      for await(let labelCol of labelCols) {
        i++;
        let label:any = await labelCol.evaluate((x:any) => x.textContent.replace(/\\n|\s+|/g, ""))
        let value:any = await dataCols[i].evaluate((x:any) => x.textContent.replace(/\\n|\s+|\[地図\]/g, ""))
        result[label] = value
      }
      //console.log("result : ", result)
      resultList.push(result)

      await page.waitForTimeout(delay);
      await page.goBack();
      await page.waitForTimeout(delay);

      await page.goBack();
      await page.waitForTimeout(delay);
    }
    await writeDataToFile(`../data/page${String(idx).padStart(2, "0")}.json`, resultList)
  }
  multibar.stop();

}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const writeDataToFile = async (filename: string, content: any[]) => {
  try {
    await writeFile(path.join(__dirname, filename), JSON.stringify(content));      
    return 'File Updated';
  } catch (err) {
    console.error(err);
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
