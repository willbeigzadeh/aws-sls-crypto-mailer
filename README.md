# AWS Serverless Crypto Mailer

_A simple AWS serverless API to fetch cryptocurrency prices and email them to a user, with search history stored in DynamoDB._

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Installation](#installation)
6. [Makefile Commands](#makefile-commands)
7. [Usage / API Documentation](#usage--api-documentation)

   - [POST /mail-current-price](#post-mail-current-price)
   - [GET /history](#get-history)

8. [Deploying](#deploying)
9. [Testing Locally](#testing-locally)
10. [License](#license)

---

## Features

- **Serverless**: 100% AWS SAM + Lambda + API Gateway
- **Email Notifications**: Uses AWS SES to send price alerts
- **Data Persistence**: Logs search history to DynamoDB
- **Configurable**: Stage, region, sender email, and CoinGecko settings via environment

---

## Prerequisites

- [AWS account](https://aws.amazon.com/) with:

  - SES sandbox or production access
  - DynamoDB permissions
  - IAM user/role for SAM deployments

- [Node.js](https://nodejs.org/) >= 22
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Git](https://git-scm.com/)
- [CoinGecko API key](https://www.coingecko.com/en/api)

---

## Project Structure

```
aws-sls-crypto-mailer/
├─ src/
│  ├─ handlers/
│  │  ├─ getCryptoCerrentPriceEmail/
│  │  │  └─ app.js      # Lambda for /mail-current-price
│  │  └─ getSearchHistory/
│  │     └─ app.js      # Lambda for /history
├─ template.yaml        # AWS SAM template
├─ package.json
├─ Makefile             # Build, deploy, lint commands
└─ README.md
```

---

## Environment Variables

Maks sure to export the following environment variables:

```dotenv
# AWS / SAM
STAGE_NAME=dev
AWS_REGION=ap-southeast-2

# SES verified sender
SENDER_EMAIL=you@domain.com

# CoinGecko
COIN_GECKO_API_KEY=your_coingecko_key
COIN_GECKO_URL=https://api.coingecko.com/api/v3/coins/markets
```

---

## Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/willbeigzadeh/aws-sls-crypto-mailer.git
   cd aws-sls-crypto-mailer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

---

## Makefile Commands

| Command         | Description                      |
| --------------- | -------------------------------- |
| `make lint`     | Run ESLint across the codebase   |
| `make validate` | Validate the SAM template        |
| `make build`    | Build the SAM application        |
| `make deploy`   | Deploy (or update) the SAM stack |

---

## Usage / API Documentation

### POST /mail-current-price

Fetches current AUD price for a symbol and emails it to the user.

- **URL**: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/mail-current-price`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:

  ```json
  {
    "symbol": "btc", // 1–10 alphanumeric
    "email": "you@domain.com"
  }
  ```

- **Response**:

  - `200 OK`:

    ```json
    { "message": "Success, check your email!" }
    ```

  - `400 Bad Request` for invalid input
  - `500 Internal Server Error` for unexpected failures

---

### GET /history

Retrieves all past searches, optionally filtered by symbol.

- **URL**: `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/history`
- **Method**: `GET`
- **Query Parameters**:

  - `symbol` (optional): 1–10 alphanumeric, case-insensitive

- **Response**:

  - `200 OK`:
    ```json
    [
      {
        "Price": 148143,
        "Symbol": "BTC",
        "Timestamp": "2025-05-04T10:49:33.028Z"
      },
      {
        "Price": 2838,
        "Symbol": "ETH",
        "Timestamp": "2025-05-04T10:51:07.359Z"
      }
    ]
    ```

---

## Deploying

Ensure your env vars are set, then:

```bash
make build
make deploy
```

---

## Testing Locally

Ensure your env vars are set, then start API locally with SAM:

```bash
sam build
sam local start-api
```

Then:

```bash
curl -X POST \
  http://127.0.0.1:3000/dev/mail-current-price \
  -H "Content-Type: application/json" \
  -d '{"symbol":"btc","email":"you@domain.com"}'
```

---

## License

MIT © Will Beigzadeh
