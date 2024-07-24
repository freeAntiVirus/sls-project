'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.FAMILY_TABLE; // replace with your DynamoDB table name

module.exports.handler = async (event, context) => {
    const requestBody = JSON.parse(event.body);
    const familyId = requestBody.familyId;
    const users = requestBody.users;

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

    try {
        const data = await dynamoDb.update(params).promise();
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Users added to family successfully!',
                updatedFamily: data.Attributes
            }),
        };
        return response;
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
};
