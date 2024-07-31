'use strict';

import AWS from 'aws-sdk';
const dynamoDb = new AWS.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from 'uuid';
import { transpileSchema } from '@middy/validator/transpile'
import schema from '../lib/schemas/createFamilySchema.js';
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import middy from '@middy/core';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpErrorHandler from '@middy/http-error-handler';

const createFamily = async (event, context, callback) => {
    const requestBody = event.body;
    const tableName = process.env.FAMILY_TABLE; 
    const familyId = uuidv4(); 
    const familyName = requestBody.familyName;
    const capacity = parseInt(requestBody.capacity, 10); // Ensure capacity is a number

    const params = {
        TableName: tableName,
        Item: {
            familyId: familyId,
            familyName: familyName,
            capacity: capacity
        }
    };

    try {
        await dynamoDb.put(params).promise()

    } catch (error) {

        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to add family to DynamoDB',
                error: error.message
            }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Family added successfully!',
            familyId: familyId,
            familyName: familyName,
            capacity: capacity
        }),
    };
};

export const handler = middy(createFamily)
  // to validate the body we need to parse it first
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(
    validator({
      eventSchema: transpileSchema(schema)
    })
  )