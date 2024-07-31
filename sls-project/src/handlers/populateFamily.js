'use strict';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.FAMILY_TABLE; // replace with your DynamoDB table name
import AWS from 'aws-sdk';
import { transpileSchema } from '@middy/validator/transpile'
import schema from '../lib/schemas/populateFamilySchema.js';
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import middy from '@middy/core';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpErrorHandler from '@middy/http-error-handler';

const populateFamily = async (event, context) => {
    const requestBody = event.body;
    const familyId = requestBody.familyId;
    const users = requestBody.users;

    ///////////
       
    // check if users in the family already 
    
    //////////

    const params = {
        TableName: tableName,
        Key: {
            familyId: familyId
        },
        UpdateExpression: 'SET #u = list_append(if_not_exists(#u, :empty_list), :users)',
        ExpressionAttributeNames: {
            '#u': 'users'
        },
        ExpressionAttributeValues: {
            ':users': users,
            ':empty_list': []
        },
        ReturnValues: 'UPDATED_NEW'
    };

    let data;
    try {
        data = await dynamoDb.update(params).promise();
    } catch (error) {
        console.error(error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to add users to family in DynamoDB',
                error: error.message
            }),
        };
        return response;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Users added to family successfully!',
            updatedFamily: data.Attributes
        }),
    };
    return response;
};

export const handler = middy(populateFamily)
  // to validate the body we need to parse it first
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(
    validator({
      eventSchema: transpileSchema(schema)
    })
  )