'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.handler = async (event, context) => {
    const params = {
        TableName: tableName
    };

    try {
        const data = await dynamoDb.scan(params).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Users retrieved successfully!',
                users: data.Items
            }),
        };
        return response;
    } catch (error) {
        console.error(error);
        const response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unable to retrieve users from DynamoDB',
                error: error.message
            }),
        };
        return response;
    }
};
