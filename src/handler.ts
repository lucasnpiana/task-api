import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { PrismaClient } from "@prisma/client";
import { CreateTaskSchema } from "./schemas";

const prisma = new PrismaClient();

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function jsonResponse(
  statusCode: number,
  payload: unknown
): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(payload),
  };
}

export const createTask = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    if (event.requestContext?.http?.method === "OPTIONS") {
      return jsonResponse(204, {});
    }

    if (!event.body) {
      return jsonResponse(400, { message: "Request body is required" });
    }

    const rawBody: unknown = JSON.parse(event.body);
    const parsed = CreateTaskSchema.safeParse(rawBody);

    if (!parsed.success) {
      return jsonResponse(400, {
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
      },
    });

    return jsonResponse(201, task);
  } catch (error) {
    return jsonResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
