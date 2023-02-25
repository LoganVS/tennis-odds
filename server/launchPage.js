const puppeteer = require('puppeteer');
const fs = require('fs');
const logger = require('./logger');
const moment = require('moment');

module.exports = async () => {
  const output = [];

  const searchsite = `https://sportsbook.draftkings.com/sports/tennis`;

  logger.info(`Launching puppeteer for ${searchsite}`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(searchsite, {waitUntil: 'networkidle0'}).catch(err => logger.error(`Error going to page: ${searchsite}. ${err}`));
  
  const matchLinkHandles = await page.$$('.sportsbook-a-to-z-sport__content-body.all .league-link a')
  const matchLinks = []

  for (let i=0; i<matchLinkHandles.length; i++) {
    const matchLinkHandle = matchLinkHandles[i];

    const matchNameHandle = await matchLinkHandle.getProperty('innerText')
    const matchName = await matchNameHandle.jsonValue();

    const hrefHandle  = await matchLinkHandle.getProperty('href');
    const href = await hrefHandle.jsonValue();

    matchLinks.push({
      matchName,
      href
    });
  }

  logger.info('Found match links:');
  logger.info(matchLinks);

  for (let i = 0; i < matchLinks.length; i++) {
    const { href, matchName } = matchLinks[i];

    logger.info(`Navigating to ${href}`);
    await page.goto(href, {waitUntil: 'networkidle0'}).catch(err => logger.error(`Error going to page: ${searchsite}. ${err}`));

    // Get to the match lines section
    const sportsbookCategoryTabNames = await page.$$('.sportsbook-category-tab-name');
    let matchLinesFound = false;
    for (let i = 0; i<sportsbookCategoryTabNames.length; i++) {
      const handle = sportsbookCategoryTabNames[i];
      const valueHandle = await handle.getProperty('innerText')
      const value = await valueHandle.jsonValue();
      if (value.toLowerCase() === 'match lines') {
        matchLinesFound = true;
        await handle.click();
      }
    }
    if (!matchLinesFound) {
      logger.info(`No match lines found for ${matchName}`)
      continue;
    }

    // Get to the money line section
    const sportsbookSubcategories = await page.$$('.sportsbook-tabbed-subheader__tab');
    let moneylineFound = false;
    for (let i = 0; i<sportsbookSubcategories.length; i++) {
      const handle = sportsbookSubcategories[i];
      const valueHandle = await handle.getProperty('innerText')
      const value = await valueHandle.jsonValue();
      if (value.toLowerCase() === 'moneyline') {
        moneylineFound = true;
        await handle.click();
      }
    }
    if (!moneylineFound) {
      logger.info(`No money line found for ${matchName}`)
      continue;
    }

    // Get each row
    const moneylineRows = await page.$$('.sportsbook-event-accordion__wrapper.expanded');
    logger.info(`Found ${moneylineRows.length} matches`)
    for (let i = 0; i<moneylineRows.length; i++) {
      const row = [matchName];
      const handle = moneylineRows[i];

      const playersAndOddsHandles = await handle.$$('.game-props-card17 li');
      logger.info(`Found ${playersAndOddsHandles.length} per this match`)
      for (let j = 0 ; j < playersAndOddsHandles.length; j++) {
        const el = playersAndOddsHandles[j];
  
        const valueHandle = await el.getProperty('innerText')
        const value = await valueHandle.jsonValue()
        const parsedValue = value.replace('\n', '').replace(/([\+|\-|−][0-9])/, ",$1")
  
        row.push(parsedValue)
      }
      const csv = row.join(',');
      output.push(csv);
      logger.info(`storing: ${csv}`)
    }
  }

  await browser.close();

  const date = moment().format('YYYY-MM-DD-HH-mm')

  output.forEach(row => {
    fs.appendFileSync(`${date}-tennis-odds.csv`, row + '\n');
  });
};
