'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Extract familyId from query parameters
    const familyId = event.queryStringParameters ? event.queryStringParameters.familyId : null;

    if (!familyId) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Missing familyId in query parameters' }),
        };
    }

    const familyTable = process.env.FAMILY_TABLE;
    const usersTable = process.env.USERS_TABLE;

    try {
        // Query the family table to get user IDs
        const familyResult = await dynamoDb.get({
            TableName: familyTable,
            Key: { familyId: familyId }
        }).promise();

        if (!familyResult.Item) {
            return {
                statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Family not found' }),
            };
        }

        const userIds = familyResult.Item.users;

        // Query the users table to get the names of the users
        const userNamesPromises = userIds.map(async (userId) => {
            const userResult = await dynamoDb.get({
                TableName: usersTable,
                Key: { userId: userId }
            }).promise();

            return userResult.Item ? userResult.Item.userName : null;
        });

        const userNames = await Promise.all(userNamesPromises);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                familyId: familyId,
                userNames: userNames.filter(name => name !== null),
            }),
        };

    } catch (error) {
        console.error("Error querying DynamoDB:", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Unable to retrieve family members from DynamoDB', error: error.message }),
        };
    }
};
