'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Extract familyId from the path parameters
    const { familyId } = event.pathParameters;
    // Extract base64 image from the request body
    const base64Image = event.body.replace(/^data:image\/\w+;base64,/,'')

    if (!familyId || !base64Image) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Missing familyId or base64Image in the request body' }),
        };
    }

    const familyTable = process.env.FAMILY_TABLE;
    const bucketName = process.env.S3_BUCKET_NAME;

    try {
        // Query the family table to get family information
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

        // Convert base64 image to binary data
        const buffer = Buffer.from(base64Image, 'base64');

        // Upload the image to S3 bucket
        const s3Params = {
            Bucket: bucketName,
            Key: `${familyId}/${Date.now()}.jpg`,
            Body: buffer,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };

        const s3Response = await s3.upload(s3Params).promise();
        
        // update family with family photo

        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Image uploaded successfully',
                s3Location: s3Response.Location
            }),
        };

    } catch (error) {
        console.error("Error querying DynamoDB or uploading to S3:", error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Unable to process the request', error: error.message }),
        };
    }
};
