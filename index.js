const Alpaca = require("@alpacahq/alpaca-trade-api");
const SMA = require("technicalindicators").SMA;
const _ = require("lodash");

const alpaca = new Alpaca({
  keyId: process.env.API_KEY,
  secretKey: process.env.SECRET_API_KEY,
  paper: true,
  use_polygon: false,
});

//print account

// async function printAccount() {
//   const account = await alpaca.getAccount();
//   console.log(account);
// }

// printAccount();

//moving averages

let sma20, sma50;
let lastOrder = "SELL";

async function initializeAverages() {
  const initialData = await alpaca.getBars("1Min", "SPY", {
    limit: 50,
    until: new Date(),
  });

  const closeValues = await _.map(initialData.SPY, (bar) => bar.closePrice);

  sma20 = new SMA({ period: 20, values: closeValues });
  sma50 = new SMA({ period: 50, values: closeValues });

  console.log(`sma20: ${sma20.getResult()}`);
  console.log(`sma50: ${sma50.getResult()}`);
}
initializeAverages();

// connecting to web socket

const client = alpaca.data_ws;

client.onConnect(() => {
  client.subscribe([
    "alpacadatav1/T.FB",
    "alpacadatav1/Q.AAPL",
    "alpacadatav1/AM.AAPL",
    "alpacadatav1/AM.FB",
  ]);
  console.log("connected to client ");
  setTimeout(() => client.disconnect(), 600 * 1000);
});

client.onStockAggSec(function (subject, data) {
  console.log(`subject: ${subject}`);
  console.log(`data: ${data}`);
});

// client.onConnect(function () {
//   console.log("Connected")
//   const keys = USE_POLYGON ? ['T.FB', 'Q.AAPL', 'A.FB', 'AM.AAPL'] :
//       ['alpacadatav1/T.FB', 'alpacadatav1/Q.AAPL', 'alpacadatav1/AM.AAPL', 'alpacadatav1/AM.FB']
//   data_client.subscribe(keys);

// client.onStockAggMin(function (subject, data) {
//   console.log(`Stock agg min: ${subject}, ${data}`);
// });

client.connect();
