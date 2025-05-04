ifndef SENDER_EMAIL
$(error SENDER_EMAIL is undefined. Please export it before running make, e.g. export SENDER_EMAIL=you@domain.com)
endif

STAGE_NAME ?= dev
AWS_REGION ?= ap-southeast-2

export STAGE_NAME
export AWS_REGION

.PHONY: lint validate build deploy

default: build

lint:
	npm run lint

validate:
	sam validate

build:
	sam build \
	  --manifest package.json \
	  --region $(AWS_REGION) \
	  --parameter-overrides StageName=$(STAGE_NAME) \
	  --parameter-overrides SenderEmail=$(SENDER_EMAIL)

deploy:
	sam deploy \
	  --stack-name aws-sls-crypto-mailer-$(STAGE_NAME) \
	  --region $(AWS_REGION) \
	  --capabilities CAPABILITY_IAM \
	  --resolve-s3 \
	  --parameter-overrides StageName=$(STAGE_NAME) \
	  --parameter-overrides SenderEmail=$(SENDER_EMAIL)\
	  
