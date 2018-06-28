const request = require('request-promise-native');
const cheerio = require('cheerio');

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    console.log(event);
    const { pokemon } = event;
    const page = await request(`http://pokemondb.net/pokedex/${pokemon.toLowerCase()}`);

    const $ = cheerio.load(page);

    // const pokemonNumber = $('#tab-basic-1 > div:nth-child(1) > div:nth-child(2) > table > tbody > tr:nth-child(1) > td > strong').html();
    const pokemonNumber = $('.vitals-table > tbody > tr:nth-child(1) > td > strong').html();

    const ddbParams = {
        TableName: 'pokemans',
        Key: {
            number: pokemonNumber
        },
        UpdateExpression: 'SET pokemon = :pkm',
        ExpressionAttributeValues: {
            ':pkm': pokemon
        }
    };

    try {
        await ddb.update(ddbParams).promise();
    } catch (error) {
        console.error(error);
    }

    callback(null, pokemonNumber);

};

