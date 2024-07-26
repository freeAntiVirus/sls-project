const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.setFamilyPhotoUrl = async (id, photoUrl) => {
    const params = {
       TableName: process.env.USERS_TABLE,
       Key: {id},
       UpdateExpression: 'set photoUrl = :photoUrl',
       ExpressionAttributeValues: {
        ':photoUrl': photoUrl,
       },
       ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDb.update(params).promise()
    return result.Attributes;
}