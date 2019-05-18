from elasticsearch import Elasticsearch,RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from botocore.vendored import requests
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
    # print(type(event))
    # print(event)
    
    index = event["t"]
    Preference = event["p"]
    user = event["user_id"]
    
    if index == "restaurants":
        Name = event["name"]
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "match": { "Name": Name }},{ "match": { "user": user }}]}}})
    
        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            
            res3 = es.update(index='restaurants', doc_type=type_, id=id_, body={"doc": {"Preference": Preference}})
            
            print("res: "+str((res)))
    
    if index == "movies":
        Name = event["name"]
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "match": { "Name": Name }},{ "match": { "user": user }}]}}})
        
    
        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            res3 = es.update(index='movies', doc_type=type_, id=id_, body={"doc": {"Preference": Preference}})
            print("res3: "+str((res3)))
    
    if index == "music":
        Name = event["name"]
        res = es.search(index=index, body={"query": {"bool": {"must": [{ "match": { "Name": Name }},{ "match": { "user": user }}]}}})
        
        for hit in res["hits"]["hits"]:
            id_ = hit["_id"]
            type_ = hit["_type"]
            res3 = es.update(index='music', doc_type=type_, id=id_, body={"doc": {"Preference": Preference}})
            
            print("res3: "+str((res3)))
            
    
    
    
    
    resp = {
        'headers': {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/plain"
        },
        
        'statusCode': 200,
        'body': str(res3)
        
    }
    
    return resp

    