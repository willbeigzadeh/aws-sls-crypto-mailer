export const handler = async (event, context) => {
  // TODO: Get email and crypto from event
  // TODO: Get current price from CoinGecko
  // TODO: Email the results using SES
  // TODO: Log the search in DynamoDB
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success, check your email!" }),
  };
};
