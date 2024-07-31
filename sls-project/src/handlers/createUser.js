'use strict';

import AWS from 'aws-sdk';
import middy from '@middy/core';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpErrorHandler from '@middy/http-error-handler'
import { v4 as uuidv4 } from 'uuid';
import { transpileSchema } from '@middy/validator/transpile'
import schema from '../lib/schemas/createUserSchema.js';
import httpHeaderNormalizer from '@middy/http-header-normalizer'


const dynamoDb = new AWS.DynamoDB.DocumentClient();

const addUser = async (event, context) => {
    const requestBody = event.body;
    const tableName = process.env.USERS_TABLE;
    const userId = uuidv4();
    const userName = requestBody.userName;
    const birthday = requestBody.birthday;

    const params = {
        TableName: tableName,
        Item: {
            userId: userId,
            userName: userName,
            birthday: birthday
        }
    };

    try {
        await dynamoDb.put(params).promise();
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to add user to DynamoDB',
                error: error.message
            }),
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'User added successfully!',
            userId: userId,
            userName: userName,
            birthday: birthday
        }),
    };
};

export const handler = middy(addUser)
  // to validate the body we need to parse it first
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(
    validator({
      eventSchema: transpileSchema(schema)
    })
)