import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
const axios = require('axios');
import Redis from 'ioredis';
const dynamodb = new DynamoDB.DocumentClient();

const SWAPI_URL = 'https://swapi.py4e.com/api/people/';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const PLANET_COORDS: Record<string, { latitude: number; longitude: number }> = {
    'Tatooine': { latitude: 32.7357, longitude: -117.1490 },
    'Alderaan': { latitude: 40.7128, longitude: -74.0060 },
    'Hoth': { latitude: 60.1282, longitude: 18.6435 },
    'Dagobah': { latitude: -3.4653, longitude: -62.2159 },
    'Endor': { latitude: 37.7749, longitude: -122.4194 },
    'Naboo': { latitude: 48.8566, longitude: 2.3522 }
};
/* interface User {
    id: string;
    names: string;
    surname: string;
    createdAt: number;
} */

const fetchData = (url:string, params = {}) => axios.get(url, { params }).then((res:any) => res.data).catch(() => null);
/* const fetch_ = (url:string, params:any) => {
    axios.get(url,{params})
    .then((res:any)=>{
        return res.data||null
    })
    .catch((error:any)=>{
        return error
    })
} */

export const test = async (event:any) => {
    const swapi = await fetchData(SWAPI_URL);
   
    const fusionados = await Promise.all(
        swapi.results.map(async (person : any)=> {
            const homeworldData = await fetchData(person.homeworld);
            const homeworldName = homeworldData?.name || 'Unknown';

            const coords = PLANET_COORDS[homeworldName] || { latitude: 0, longitude: 0 };
            
            const weather = await fetchData(WEATHER_URL, { 
                latitude: coords.latitude, 
                longitude: coords.longitude, 
                current_weather: true 
            });

            return { 
                name: person.name, 
                homeworld: homeworldName, 
                weather: weather?.current_weather || {} 
            };
        })
    );

    for (const person of fusionados) {
        await dynamodb.put({
            TableName: 'Test',
            Item: {
                id: Date.now().toString(), 
                name: person.name,
                homeworld: person.homeworld,
                weather: person.weather,
            }
        }).promise();
    }

    return { statusCode: 200, body: JSON.stringify(fusionados) };
}

export const createUser = async (event: any) => {
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
            TableName: 'User',
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
            TableName: 'User'
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
