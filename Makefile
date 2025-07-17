ifndef SENDER_EMAIL
$(error SENDER_EMAIL is undefined. Please export it before running make, e.g. export SENDER_EMAIL=you@domain.com)
endif

ifndef COIN_GECKO_API_KEY
$(error COIN_GECKO_API_KEY is undefined. Please export it before running make)
endif

ifndef COIN_GECKO_URL
$(error COIN_GECKO_URL is undefined. Please export it before running make)
endif


STAGE_NAME ?= dev
AWS_REGION ?= ap-southeast-2

export STAGE_NAME
export AWS_REGION

.PHONY: lint validate build deploy delete

default: build

lint:
	npm run lint

validate:
	sam validate

build:
	sam build \
	  --manifest package.json \
	  --region $(AWS_REGION) \
	  --parameter-overrides \
	  	StageName=$(STAGE_NAME) \
		SenderEmail=$(SENDER_EMAIL) \
		CoinGeckoApiKey=$(COIN_GECKO_API_KEY) \
		CoinGeckoUrl=$(COIN_GECKO_URL)

deploy:
	sam deploy \
	  --stack-name aws-sls-crypto-mailer-$(STAGE_NAME) \
	  --region $(AWS_REGION) \
	  --capabilities CAPABILITY_IAM \
	  --resolve-s3 \
	  --parameter-overrides \
		StageName=$(STAGE_NAME) \
		SenderEmail=$(SENDER_EMAIL) \
	  	CoinGeckoApiKey=$(COIN_GECKO_API_KEY) \
	  	CoinGeckoUrl=$(COIN_GECKO_URL)
  
delete:
	sam delete \
	  --stack-name aws-sls-crypto-mailer-$(STAGE_NAME) \
	  --region $(AWS_REGION)
