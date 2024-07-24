'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.handler = (event, context, callback) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error("Error parsing request body:", error);
        const response = {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Invalid request body',
                error: error.message
            }),
        };
        callback(null, response);
        return;
    }

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

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Unable to add family to DynamoDB',
                    error: error.message
                }),
            };
            callback(null, response);
            return;
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Family added successfully!',
                familyId: familyId,
                familyName: familyName,
                capacity: capacity
            }),
        };
        callback(null, response);
    });
};
