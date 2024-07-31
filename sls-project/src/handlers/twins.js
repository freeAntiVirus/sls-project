'use strict';

import AWS from aws-sdk;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

export const handler = async (event, context) => {
    // Retrieve all users
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

        // Check for users with the same birthday
        const birthdayMap = new Map();
        for (const item of scanData.Items) {
            if (birthdayMap.has(item.birthday)) {
                birthdayMap.get(item.birthday).push(item.userName);
            } else {
                birthdayMap.set(item.birthday, [item.userName]);
            }
        }

        // Filter out birthdays with only one user
        const twins = Array.from(birthdayMap.entries()).filter(([birthday, names]) => names.length > 1);

        if (twins.length > 0) {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Luck is on your side, you found twins.',
                    twins: twins.map(([birthday, names]) => ({
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
