const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://covid19honduras.org/';

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();

    await page.goto(url);

    // Method to create a faster Page
    // From: https://github.com/shirshak55/scrapper-tools/blob/master/src/fastPage/index.ts#L113
    const session = await page.target().createCDPSession();
    await page.setBypassCSP(true);
    await session.send('Page.enable');
    await session.send('Page.setWebLifecycleState', {
      state: 'active',
    });

    // Bloquea la carga de recursos como imagenes y css
    await page.setRequestInterception(true);

    const rawData = await page.evaluate(() => {
      let data = [];
      let table = document.getElementById('tablaDatos');

      for (var i = 1; i < table.rows.length; i++) {
        let objCells = table.rows.item(i).cells;

        let values = [];
        for (var j = 0; j < objCells.length; j++) {
          let text = objCells.item(j).innerHTML;
          values.push(text);
        }
        let d = { i, values };
        data.push(d);
      }

      return data;
    });

    console.log(rawData);
  } catch (error) {
    console.log('error', error);
  }
})();
