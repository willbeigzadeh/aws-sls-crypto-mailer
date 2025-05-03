export const handler = async (event, context) => {
  // TODO: Query and return search history form DynamoDB
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success, here are the search history." }),
  };
};
