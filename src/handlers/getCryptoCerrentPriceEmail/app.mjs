const symbolRegex = /^[A-Za-z0-9]{1,10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // TODO: Email the results using SES
  // TODO: Log the search in DynamoDB
  response.body = JSON.stringify({ message: "Success, check your email!" });
  return response;
};
