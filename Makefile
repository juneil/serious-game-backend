env?=dev
region?=eu-west-1
runScenario?=./node_modules/.bin/run-scenario
cleanTestingInfra?=./node_modules/.bin/clean-all-testing-infra

-include environments/$(env).mvars

LoggerLevel?=info
QueueReceiveCount?=5

pkg-name=$(shell npm run get-name -s)
pkg-version=$(shell npm run get-version -s)
accountId=$(shell aws sts get-caller-identity --query Account --output text)
gitCommit=$(shell git rev-parse --short HEAD)
gitVersion?=$(shell git describe --tags --exact-match 2>/dev/null || echo "none")
gitRepoName?=$(shell git remote get-url origin)

# Specify which environments have X-Ray enabled
xRayEnabledEnvironments=staging preprod prod

# API base domain
baseDomain?=skillins.io
apiBaseDomain?=api.$(baseDomain)

stackSuffix?=$(env)
stackName?=${pkg-name}-$(stackSuffix)

apiStageName?=v1
apiName?=Skillins Backend
EventBusName?=default

certificateArn?="arn:aws:acm:eu-west-1:826156920251:certificate/81d30117-84d4-4b78-a1f1-06846c98719e"

# Enable X-Ray based on the environment
ifneq ($(findstring $(env), $(xRayEnabledEnvironments)), )
enableApiTracing=true
enableLambdaTracing=Active
else
enableApiTracing=false
enableLambdaTracing=PassThrough
endif

ifeq ($(env), dev)
allowedOrigins=*
else ifeq ($(env), test)
allowedOrigins=*
endif

# List all other stacks dependencies
# elasticSearchStackName can be removed if unnecessary
stackNames=
# Generate targets files names
stackOutputs:=$(patsubst %, %.outputs, $(stackNames))

templateBucket=skillins-init

.PHONY: all build package deploy clean test-e2e clean-e2e

# First rule is the default rule
all: clean build package deploy

# Intermediate targets are deleted once
# they have served their purpose
.INTERMEDIATE: $(stackNames)

# Make actual files corresponding to the name
# of the stacks to avoid rebuilding .outputs
# files every time
$(stackNames):
	@touch $@

# Make sure we remove the outputs if the
# command failed
.DELETE_ON_ERROR: %.outputs

.PHONY: describe show set-npmrc build package clean-package deploy clean

# describe requires all stack outputs
describe: $(stackOutputs)
# Grep is used to show the file name
	@grep '' *.outputs

# Loop through all stackNames and generate appropriate outputs
%.outputs: %
	@aws cloudformation describe-stacks --stack-name $< \
		--query "sort_by(Stacks[0].Outputs, &OutputKey)[*].[OutputKey, OutputValue]" \
		--output text > $@

show:
	@aws cloudformation describe-stacks --stack-name $(stackName) \
		--query "sort_by(Stacks[0].Outputs, &OutputKey)[*].[OutputKey, OutputValue]" \
		--output text

~/.npmrc:
	npm config set @ekonoo:registry https://npm.pkg.github.com/
	npm config set //npm.pkg.github.com/:_authToken $(NPM_TOKEN)

node_modules: ~/.npmrc package.json package-lock.json
	@npm ci
	@touch node_modules

build: node_modules clean-package
	@npm run build
	@npm run build:layer


# Package forces the packaging to happen
package: clean-package template-output.yml

clean-package:
	-@rm template-output.yml

template-output.yml:
	@sam package \
		--region $(region) \
		--template-file sam/template.yml \
		--s3-prefix $(pkg-name)/$(prId) \
		--s3-bucket $(templateBucket) \
		--output-template-file template-output.yml

# Parameters containing whitespace need to be heavily
# escaped and the definition made very verbose
# Otherwise the more simple Key=Value format can be used
deploy: template-output.yml
	@sam deploy \
		--region $(region) \
		--template-file template-output.yml \
		--no-fail-on-empty-changeset \
		--stack-name $(stackName) \
		--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
		--tags \
			skillins:cloudformation:stack-name=$(stackName) \
			skillins:git:commit=$(gitCommit) \
			skillins:git:version=$(gitVersion) \
			skillins:git:source=$(gitRepoName) \
		--parameter-overrides "\
			ParameterKey=ApiName,ParameterValue='$(apiName)'\
			ParameterKey=ApiStageName,ParameterValue=$(apiStageName) \
			ParameterKey=EnableApiTracing,ParameterValue=$(enableApiTracing) \
			ParameterKey=EnableLambdaTracing,ParameterValue=$(enableLambdaTracing) \
			ParameterKey=ServiceName,ParameterValue=$(pkg-name) \
			ParameterKey=LoggerLevel,ParameterValue=$(LoggerLevel) \
			ParameterKey=QueueReceiveCount,ParameterValue=$(QueueReceiveCount) \
			ParameterKey=EventBusName,ParameterValue=$(EventBusName)" \
			ParameterKey=ApiDomain,ParameterValue=$(apiBaseDomain)" \
			ParameterKey=DomainName,ParameterValue=$(baseDomain)" \
			ParameterKey=Certificate,ParameterValue='$(certificateArn)'"

swagger:
	@npm run build:swagger
	@aws --region $(region) s3 cp ./dist/swagger.json s3://$(templateBucket)/swagger.json


clean-stack:
	-aws --region $(region) \
	    cloudformation delete-stack \
		--stack-name $(stackName)-monitoring

	-aws --region $(region) \
	    cloudformation delete-stack \
		--stack-name $(stackName)

	-@aws --region $(region) \
		cloudformation wait stack-delete-complete \
		--stack-name $(stackName)

clean:
	-@rm -f *.outputs
	-@rm -f template-output.yml
	-@rm -rf node_modules
	-@rm -rf dist
