import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createTask } from "./handler";

const event = {
  version: "2.0",
  routeKey: "POST /tasks",
  rawPath: "/tasks",
  rawQueryString: "",
  headers: {
    "content-type": "application/json",
  },
  requestContext: {
    accountId: "000000000000",
    apiId: "local",
    domainName: "localhost",
    domainPrefix: "local",
    http: {
      method: "POST",
      path: "/tasks",
      protocol: "HTTP/1.1",
      sourceIp: "127.0.0.1",
      userAgent: "local-test",
    },
    requestId: "local-request-id",
    routeKey: "POST /tasks",
    stage: "$default",
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
  },
  body: JSON.stringify({
    title: "Estudar Serverless",
    description: "Construir a Task API com Lambda, Prisma e Zod",
  }),
  isBase64Encoded: false,
} as APIGatewayProxyEventV2;

async function main(): Promise<void> {
  const response = await createTask(event);
  console.log(JSON.stringify(response, null, 2));
}

void main();
