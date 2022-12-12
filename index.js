const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient()
const dynamoDBTableName = 'SuperheroesTable';

exports.handler = async (event) => {
    switch(event.info.fieldName){
        case "getSuperheroById":
            return await getSuperheroById(event.arguments.heroId)
        case "listAllSuperheroes":
            return await listAllSuperheroes()
        case "searchSuperheroByKeyword":
            return await searchSuperheroByKeyword(event.arguments.keyword)
        case "updatePowerStatsById":
            return await updatePowerStatsById(event.arguments)
        default:
            return { data: "Hello from Lambda, Default Case" }
    }
};

async function listAllSuperheroes(){
    const params = {
        TableName: dynamoDBTableName,
    }
    try {
        const { Items } = await docClient.scan(params).promise()
        return Items
    }
    catch(err) {
        console.log("DDB Error: ", err)
    }
}

async function getSuperheroById(heroId){
    const params = {
        TableName: dynamoDBTableName,
        Key: {
            id: heroId
        }
    }
    try {
        const { Item } = await docClient.get(params).promise()
        return Item
    }
    catch(err) {
        console.log("DDB Error: ", err)
    }
}

async function searchSuperheroByKeyword(searchKeyword){
    const params = {
            TableName: dynamoDBTableName,
            IndexName: "name-index",
            FilterExpression: "contains(#name, :searchKeyword)",
            ExpressionAttributeNames: {
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ':searchKeyword': searchKeyword,
            },
        };
    try {
        const { Items } = await docClient.scan(params).promise()
        return Items
    }
    catch(err) {
        console.log("DDB Error: ", err)
    }
}

async function updatePowerStatsById(eventArguments){
    const params = {
        TableName: dynamoDBTableName,
        Key: {
            id: eventArguments.heroId
        },
        UpdateExpression: 'set powerstats.#a = :x',
        ExpressionAttributeNames: {'#a' : eventArguments.powerstatName},
        ExpressionAttributeValues: {':x' : eventArguments.powerstatValue}
    }
    try {
        const { Item } = await docClient.update(params).promise()
        return { data: eventArguments.heroId }
    }
    catch(err) {
        console.log("DDB Error: ", err)
    }
}