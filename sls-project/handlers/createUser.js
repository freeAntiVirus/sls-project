'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.handler = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
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

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
            const response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Unable to add user to DynamoDB',
                    error: error.message
                }),
            };
            callback(null, response);
            return;
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User added successfully!',
                userId: userId,
                userName: userName,
                birthday: birthday
            }),
        };
        callback(null, response);
    });
};
