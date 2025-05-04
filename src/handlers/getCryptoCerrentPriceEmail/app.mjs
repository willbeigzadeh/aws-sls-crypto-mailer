import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

const sesClient = new SESClient();
const dynamoDBClient = new DynamoDBClient({});

const symbolRegex = /^[A-Za-z0-9]{1,10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendPriceEmail = async (from, to, symbol, price) => {
  from = String(from).toLowerCase();
  to = String(to).toLowerCase();
  symbol = String(symbol).toUpperCase();

  var params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            '<p style="font-size:1.4rem">' +
            "The current price of " +
            `<strong>${symbol}</strong>` +
            " is " +
            `<strong>${price} AUD</strong>` +
            "." +
            "</p>" +
            "<hr />" +
            "<p>" +
            "Powered by " +
            "<a " +
            'href="https://www.coingecko.com/en/api/"' +
            'target="_blank"' +
            ">" +
            "CoinGecko API" +
            "</a>" +
            "</p>",
        },
        Text: {
          Charset: "UTF-8",
          Data:
            `The current price of ${symbol} is ${price} AUD.` +
            "\nPowered by CoinGecko API",
        },
      },

      Subject: {
        Charset: "UTF-8",
        Data: `Crypto Current Price`,
      },
    },
    Source: from,
  };

  const command = new SendEmailCommand(params);

  const result = await sesClient.send(command);

  return result;
};

const saveSearchHistory = async (tableName, symbol, price) => {
  symbol = String(symbol).toUpperCase();

  const timestamp = new Date().toISOString();
  const item = marshall({
    Symbol: symbol.toUpperCase(),
    Timestamp: timestamp,
    Price: price,
  });

  const command = new PutItemCommand({
    TableName: tableName,
    Item: item,
  });

  await dynamoDBClient.send(command);
};

export const handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
  };

  let input;
  try {
    input = JSON.parse(event.body);
  } catch (err) {
    response.statusCode = 400;
    const message = JSON.stringify({ message: "Invalid JSON body." });
    console.error(message, err);
    response.body = message;
    return response;
  }

  const { symbol, email } = input;
  if (typeof symbol !== "string" || !symbolRegex.test(symbol)) {
    response.statusCode = 400;
    const message = JSON.stringify({
      message: `Invalid 'symbol': '${symbol}'.`,
    });
    console.error(message);
    response.body = message;
    return response;
  }
  if (typeof email !== "string" || !emailRegex.test(email)) {
    response.statusCode = 400;
    const message = JSON.stringify({
      message: `Invalid 'symbol': '${symbol}'.`,
    });
    console.error(message);
    response.body = message;
    return response;
  }
  console.log("input:", { symbol, email });

  // TODO: Get current price from CoinGecko
  const stubPrice = 3.96;

  const senderEmail = process.env.SENDER_EMAIL || "";
  if (typeof senderEmail !== "string" || !emailRegex.test(senderEmail)) {
    response.statusCode = 500;
    const message = JSON.stringify({
      message: "Internal server error",
    });
    console.error(`Sender email invalid: ${senderEmail}`);
    response.body = message;
    return response;
  }
  try {
    const emailResult = await sendPriceEmail(
      senderEmail,
      email,
      symbol,
      stubPrice
    );
    console.log("Email result:", emailResult);
  } catch (err) {
    response.statusCode = 500;
    const message = JSON.stringify({
      message: "Internal error sending email.",
    });
    console.error(message, err);
    response.body = message;
    return response;
  }

  const tableName = process.env.SEARCH_HISTORY_TABLE || "";
  if (!tableName) {
    console.warn("Table name is not set. Skipping the logging.");
  } else {
    try {
      await saveSearchHistory(tableName, symbol, stubPrice);
      console.log("Successfully logged to DynamoDB.");
    } catch (err) {
      console.error("Internal error writing to DynamoDB:", err);
    }
  }

  response.body = JSON.stringify({ message: "Success, check your email!" });
  return response;
};
