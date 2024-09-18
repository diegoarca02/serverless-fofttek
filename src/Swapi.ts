const axios = require('axios');

export const getData = async (event:any) => {
    try {
        const characters : Array<any>= [];
        const limit = 5;
        let count = 0;
        let nextPage = 'https://swapi.dev/api/people/';

        while (nextPage && count < limit) {
            const response = await axios.get(nextPage);

            if (!Array.isArray(response.data.results)) {
                throw new Error('Unexpected response format');
            }

            for (const character of response.data.results) {
                if (count >= limit) {
                    break;
                }

                characters.push({
                    nombres: character.name,
                    altura: character.height,
                    color_ojos: character.eye_color,
                    genero: character.gender
                });
                count++;
            }

            nextPage = response.data.next;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Successfully fetched characters",
                data: characters,  // Lista con los primeros 5 personajes
            }),
        };

    } catch (error:any) {
        
        console.error('Error getting data:', error.message || error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error getting data',
                error: error.message || 'Unknown error',
            }),
        };
    }
};