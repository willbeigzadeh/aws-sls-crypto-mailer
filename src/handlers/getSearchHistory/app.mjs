import {
  DynamoDBClient,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDBClient = new DynamoDBClient({});

const symbolRegex = /^[A-Za-z0-9]{1,10}$/;

export const handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const tableName = process.env.SEARCH_HISTORY_TABLE || "";
  if (!tableName) {
    response.statusCode = 500;
    const message = JSON.stringify({
      message: "Internal error reading database.",
    });
    console.error(message, "SEARCH_HISTORY_TABLE not set.");
    response.body = message;
    return response;
  }

  let items;

  const symbolQuery = event.queryStringParameters?.symbol;
  if (symbolQuery) {
    if (typeof symbolQuery !== "string" || !symbolRegex.test(symbolQuery)) {
      response.statusCode = 400;
      const message = JSON.stringify({
        message:
          `Invalid symbol filter "${symbolQuery}".` +
          " Must be 1-10 alphanumeric characters.",
      });
      console.error(message);
      response.body = message;
      return response;
    }

    const query = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "Symbol = :sym",
      ExpressionAttributeValues: {
        ":sym": { S: symbolQuery.toUpperCase() },
      },
    });
    try {
      const result = await dynamoDBClient.send(query);
      items = result.Items || [];
      items = items.map((item) => {
        return unmarshall(item);
      });
    } catch (err) {
      response.statusCode = 500;
      const message = JSON.stringify({
        message: "Internal server error",
      });
      console.error("DynamoDB query error:", err);
      response.body = message;
      return response;
    }

    response.statusCode = 200;
    response.body = JSON.stringify(items);
    return response;
  }

  const scan = new ScanCommand({ TableName: tableName });
  try {
    const result = await dynamoDBClient.send(scan);
    items = result.Items || [];
    items = items.map((item) => {
      return unmarshall(item);
    });
  } catch (err) {
    response.statusCode = 500;
    const message = JSON.stringify({
      message: "Internal server error",
    });
    console.error("DynamoDB scan error:", err);
    response.body = message;
    return response;
  }

  response.statusCode = 200;
  response.body = JSON.stringify(items);
  return response;
};
