'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

module.exports.handler = async (event, context) => {
    // Step 1: Retrieve all users
    const scanParams = {
        TableName: tableName
    };

    try {
        const scanData = await dynamoDb.scan(scanParams).promise();
        if (!scanData.Items || scanData.Items.length === 0) {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'No users found in the database.'
                }),
            };
            return response;
        }

        // Step 2: Check for users with the same birthday
        const birthdayMap = new Map();
        for (const item of scanData.Items) {
            if (birthdayMap.has(item.birthday)) {
                birthdayMap.get(item.birthday).push(item.userName);
            } else {
                birthdayMap.set(item.birthday, [item.userName]);
            }
        }

        // Filter out birthdays with only one user
        const irishTwins = Array.from(birthdayMap.entries()).filter(([birthday, names]) => names.length > 1);

        if (irishTwins.length > 0) {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Luck is on your side, you are Irish twins.',
                    twins: irishTwins.map(([birthday, names]) => ({
                        birthday: birthday,
                        names: names.join(' and ')
                    }))
                }),
            };
            return response;
        } else {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Unlucky, no matching birthdays found.'
                }),
            };
            return response;
        }
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
