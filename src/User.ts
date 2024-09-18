import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

interface User {
  id: string;
  names: string;
  surname: string;
  createdAt: number;
}

export const newUser = async (event: any) => {
    try {
        const { names, surname } = JSON.parse(event.body);
        const createdAt = Date.now();
        const id = uuidv4();

        const newUser = {
            id,
            names,
            surname,
            createdAt,
        };

        await dynamodb.put({
            TableName: 'UsersModel',
            Item: newUser,
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify(newUser),
        };
    } catch (error:any) {
        console.error('Error fetching users:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching users',
                error: error.message || 'Unknown error',
            }),
        };
    }
};

export const getUsers = async (event: any) => {
    try {
        const result = await dynamodb.scan({
            TableName: 'UsersModel'
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (error:any) {
        console.error('Error fetching users:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching users',
                error: error.message || 'Unknown error',
            }),
        };
    }
}

export const getUser = async (event:any) => {
    try {
        const { id } = event.pathParameters;
        
        const result = await dynamodb.get({
            TableName: 'UsersModel',
            Key: { id }
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'User not found',
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error:any) {
        console.error('Error fetching user:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching user',
                error: error.message || 'Unknown error',
            }),
        };
    }
};

export const deleteUser = async (event:any) => {
    try {
        const { id } = event.pathParameters;

        const result = await dynamodb.delete({
            TableName: 'UsersModel',
            Key: { id },
            ConditionExpression: "attribute_exists(id)",
            ReturnValues: "ALL_OLD"
        }).promise();

        if (!result.Attributes) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'User not found',
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User deleted successfully",
                deletedUser: result.Attributes,
            }),
        };
    } catch (error:any) {
        console.error('Error deleting user:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error deleting user',
                error: error.message || 'Unknown error',
            }),
        };
    }
}; 