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
	  --parameter-overrides StageName=$(STAGE_NAME)

deploy:
	sam deploy \
	  --stack-name aws-sls-crypto-mailer-$(STAGE_NAME) \
	  --region $(AWS_REGION) \
	  --capabilities CAPABILITY_IAM \
	  --parameter-overrides StageName=$(STAGE_NAME) \
	  --resolve-s3
