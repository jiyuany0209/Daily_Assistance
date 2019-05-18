from elasticsearch import Elasticsearch,RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.vendored import requests
import boto3
import json
import logging
from boto3.dynamodb.conditions import Key, Attr
logger = logging.getLogger()
logger.setLevel(logging.INFO)

session = boto3.Session()
credentials = session.get_credentials()
access_key = credentials.access_key
secret_key = credentials.secret_key
region = 'us-east-1'

host = 'search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com'
awsauth = AWS4Auth(access_key,secret_key, region, 'es',session_token=credentials.token)

def lambda_handler(event,context):
    
    es = Elasticsearch(
            hosts=[{'host': host, 'port': 443}],
            http_auth=awsauth,
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection
        )

    index = event["queryStringParameters"]["t"]
    Preference = event["queryStringParameters"]['p']
    user = event["queryStringParameters"]["user_id"]
    
    results = []
    
    if index == "restaurants":
        
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "term": { "Preference": Preference }},{ "match": { "user": user }}]}}})
    
        #res2 = es.search(index=index, body={"query": {"match_all":{}}})
        print("res: "+str((res['hits']['hits'])))
        #print("res2: "+str((res2['hits']['hits'])))
    
    
        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            db_id = hit["_source"]["db_id"]
            
            
            dynamodb = boto3.resource('dynamodb')
            table = dynamodb.Table('restaurants')
            response = table.query(KeyConditionExpression=Key('_id').eq(db_id))
            
            item = response['Items'][0]
            
            item_name = item["Name"]
            item_type = "restaurants"
            item_info = "Address: "+ item["Address"] + ", " + item["City"] + "; " + "Cuisine: " + item["Cuisine"] + "; " + "Rating: " + str(item["Rating"]) + "."
            item_address = item["Address"] + ", " + item["City"]
            
        
            result = {'name': item_name, 'type': item_type, 'info': item_info, 'address': item_address, 'rating': str(item["Rating"]),'cuisine':item["Cuisine"] }
            print(str(result))
            
            results.append(result)
            
    
    if index == "movies":
        
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "term": { "Preference": Preference }},{ "match": { "user": user }}]}}})
        
        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            db_id = hit["_source"]["db_id"]
            
            
            dynamodb = boto3.resource('dynamodb')
            table = dynamodb.Table('movies')
            response = table.query(KeyConditionExpression=Key('_id').eq(db_id))
            
            
            item = response['Items'][0]
            
            item_name = item["Name"]
            item_type = "movies"
            item_info = item["Poster"]
            item_movie = "Genre: "+ item['Genre'] +  "; " + "Release Date: " + item["Release_date"] + "; " + "Rating: " + str(item["Rating"]) + "."
            item_overview = item['Overview']
            
            
            result = {'name': item_name, 'type': item_type, 'info': item_info, 'movie': item_movie, 'overview': item_overview }
            print(str(result))
            
            results.append(result)   
        
    
    if index == "music":
        
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "term": { "Preference": Preference }},{ "match": { "user": user }}]}}})
    
        print("res: "+str((res['hits']['hits'])))

        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            db_id = hit["_source"]["db_id"]
            
            dynamodb = boto3.resource('dynamodb')
            table = dynamodb.Table('musiic')
            response = table.query(KeyConditionExpression=Key('_id').eq(db_id))
            
            print(response)
            
            item = response['Items'][0]
            
            item_name = item["Name"]
            item_type = "music"
            item_info = "Artist: "+ item["Artist"] + ", " + "Playcount: " + item["playcount"] + "."
            item_url = item["url"]
            
            result = {'name': item_name, 'type': item_type, 'info': item_info, 'url': item_url,"artist": item["Artist"], "playcount" :item["playcount"]  }
            print(str(result))
            
            results.append(result)    
    
    
    
    response1 = {
        "results": results
    }
    
    
    resp = {
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        
        'statusCode': 200,
        'body': json.dumps(response1)
        
    }
    
    return resp