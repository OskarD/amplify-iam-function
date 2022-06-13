/* Amplify Params - DO NOT EDIT
	API_AMPLIFYIAMFUNCTION_GRAPHQLAPIENDPOINTOUTPUT
	API_AMPLIFYIAMFUNCTION_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { Sha256 } = require('@aws-crypto/sha256-js')
const { defaultProvider } = require('@aws-sdk/credential-provider-node')
const { SignatureV4 } = require('@aws-sdk/signature-v4')
const { HttpRequest } = require('@aws-sdk/protocol-http')

const GRAPHQL_ENDPOINT = process.env.API_AMPLIFYIAMFUNCTION_GRAPHQLAPIENDPOINTOUTPUT
const AWS_REGION = process.env.REGION

const query = /* GraphQL */ `
  query LIST_BLOGS {
    listBlogs {
      items {
        id
        name
      }
    }
  }
`;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    const { default: fetch, Request } = await import('node-fetch')

    console.log(`EVENT: ${JSON.stringify(event)}`);

    const endpoint = new URL(GRAPHQL_ENDPOINT);

    const signer = new SignatureV4({
        credentials: defaultProvider(),
        region: AWS_REGION,
        service: 'appsync',
        sha256: Sha256
    });

    const requestToBeSigned = new HttpRequest({
        method: 'POST',
        headers: {
            host: endpoint.host
        },
        hostname: endpoint.host,
        body: JSON.stringify({ query }),
        path: endpoint.pathname
    });

    const signed = await signer.sign(requestToBeSigned);
    const request = new Request(endpoint, signed);

    let statusCode = 200;
    let body;
    let response;

    try {
        response = await fetch(request);
        body = await response.json();
        if (body.errors) statusCode = 400;
    } catch (error) {
        statusCode = 500;
        body = {
            errors: [
                {
                    message: error.message
                }
            ]
        };
    }

    return {
        statusCode,
        body: JSON.stringify(body)
    };
};