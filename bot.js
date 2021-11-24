const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = "";
const apiToken = "";

const request = require("request");

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
// Matches "/echo [whatever]"
let beginMessage = true;
bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  const user = msg.chat.first_name;
  bot.sendMessage(
    chatId,
    user + "! Write name of the stock to get it current price.\nExample: IMB"
  );
});
beginMessage = false;

bot.onText(/(.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  let stock_ticker = match[1]; // the captured "whatever"
  const user = msg.chat.first_name;
  // send back the matched "whatever" to the chat
  const url =
    "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
    stock_ticker +
    "&interval=1min&apikey=" +
    apiToken;

  const getDataObject = () => {
    request.get(
      {
        url: url,
        json: true,
        headers: { "User-Agent": "request" },
      },
      (err, res, data) => {
        if (err) {
          data = undefined;
          console.log("Hello2");
        } else if (res.statusCode !== 200) {
          data = undefined;
        } else {
          // data is successfully parsed as a JSON object:
          console.log(data);
          //console.log(data)
          const getData = () => {
            const last_time_stamp = data["Meta Data"]["3. Last Refreshed"];
            const priceOpen =
              data["Time Series (1min)"][last_time_stamp]["1. open"];
            const priceClose =
              data["Time Series (1min)"][last_time_stamp]["4. close"];
            const priceHigh =
              data["Time Series (1min)"][last_time_stamp]["2. high"];
            const priceLow =
              data["Time Series (1min)"][last_time_stamp]["3. low"];
            bot.sendMessage(
              chatId,
              `The price of ${stock_ticker} on the ${last_time_stamp}is: \n🏷️Open: ${priceOpen}\n📊Close: ${priceClose}\n📈High: ${priceHigh}\n📉Low: ${priceLow}`
            );
          };
          if ("Error Message" in data) {
            bot.sendMessage(
              chatId,
              `😢Your input "${stock_ticker}" is incorrect.\nPlease write the name of the ticker one more time`
            );
            while (!data) {
              bot.onText(/(.+)/, (msg, match) => {
                stock_ticker = match[1];
              });
              getData();
            }
          } else {
            getData();
          }
        }
      }
    );
  };
  getDataObject();
});
