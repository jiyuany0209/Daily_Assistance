from elasticsearch import Elasticsearch,RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3
import json
import logging
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

    date = event["queryStringParameters"]["d"]
    userId = event["queryStringParameters"]["user_id"]
    
    
    res = es.search(index="reminder", body={"query":  {"bool":{ "must": [{"match": {"Date": date}},{"match":{"user":userId}}]}}})
    #res2 = es.search(index="reminder", body={"query": {"match_all":{}}})
    #print("res2:"+ str(res2))
    
    results = []
    
    for hit in res["hits"]["hits"]:
        Events = hit["_source"]["Events"]
        Date = hit["_source"]['Date']
        Time = hit["_source"]['Time']
        result = {'date': Date, 'time': Time, 'what': Events}
        results.append(result)
    
    response = {
        "results": results
    }
    
    resp = {
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        
        'statusCode': 200,
        'body': json.dumps(response)
        
    }
    
    return resp