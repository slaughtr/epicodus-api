const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

exports.handler = async (event, context, callback) => {
    // console.log(event);
    const { pokemon } = event.query;
    console.log(pokemon);
    const ddbParams = {
        TableName: 'pokemans',
        FilterExpression: '#pkm = :pkm',
        ExpressionAttributeValues: {
            ':pkm': pokemon
        },
        ExpressionAttributeNames: {
            '#pkm': 'pokemon'
        }
    };

    let result;
    try {
        result = await ddb.scan(ddbParams).promise();
        console.log(result);

        if (!result.Items.length) {
            const lambdaParams = {
                FunctionName: 'scrapePokemonData',
                Payload: JSON.stringify({ pokemon })
            };
            await lambda.invoke(lambdaParams).promise();

            result = await ddb.scan(ddbParams).promise();
            console.log('Next result: ', result);
        }
    } catch (error) {
        console.error(error);
    }

    callback(null, result.Items[0]);

};


/*
{
    "params": {
       #foreach($param in $input.params().path.keySet())
       "$param": "$util.escapeJavaScript($input.params().path.get($param))" #if($foreach.hasNext),#end

       #end
     },
     "query": {
       #foreach($queryParam in $input.params().querystring.keySet())
       "$queryParam": "$util.escapeJavaScript($input.params().querystring.get($queryParam))" #if($foreach.hasNext),#end

       #end
     }
   }
   */