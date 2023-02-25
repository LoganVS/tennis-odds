const logger = require('./logger');
const launchPage = require('./launchPage');
const fs = require('fs');

global.logger = logger;

const start = async function() {

  logger.info(`Starting scrape`);
  await launchPage();

  logger.info(`Finished scrape.`);
  return;
}

start();
