import math
import datetime
import json
import time
import os
import logging
import boto3
from botocore.vendored import requests
from decimal import *
from boto3.dynamodb.conditions import Key, Attr
import json
from datetime import datetime
import sys
import urllib
import time
from elasticsearch import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import collections


logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service)

es = Elasticsearch(['https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com:443'])

sqs = boto3.client('sqs')
sqsurl = 'https://sqs.us-east-1.amazonaws.com/746588919426/proj'
   
def sendSQS(message):
    MessageAttribute = {
        'Title': {
            'DataType': 'String',
            'StringValue': 'The Whistler'
        }
    }
    response = sqs.send_message(QueueUrl=sqsurl, MessageBody= message)
    return response   
    
def get_slots(intent_request):
    return intent_request['currentIntent']['slots']

def close(fulfillment_state, message):
    response = {
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }

    return response

def lambda_handler(event, context):
    userId = event["userId"]
    Start = get_slots(event)["Start"]
    End = get_slots(event)['End']
    Phone = get_slots(event)['Phone']
    total = es.search(index="reminder", body={
    "query": { 
        "bool": {
            "must": [{
                "range": {
                    "Date": {
                        "gte": Start,
                        "lte": End
                    }
                }},
                {"match":{
                    "user" : userId
                }
            }]
        }
    }})
    res = total['hits']['hits']
    if len(res) == 0:
        message = "Sorry, there's no available reminders in this period!"
    else:
        content = collections.defaultdict(list)
        for dic in res:
            dic = dic['_source']
            content['Events'].append(dic['Events'])
            content['Date'].append(dic['Date'])
            content['Time'].append(dic['Time'])
        content['Phone'] = str(Phone)
        content['total'] = str(len(res))
        content = json.dumps(content)
        sendSQS(content)
        message = "got it! There are " + str(len(res)) + " records in total. I'll send them to you in a minute."
        

    return close('Fulfilled',
             {'contentType': 'PlainText',
              'content': message})




