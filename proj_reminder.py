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

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service)

es = Elasticsearch(['https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com:443'])

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
    Events = get_slots(event)["Events"]
    Time = get_slots(event)['Time']
    Date = get_slots(event)['Date']
    message = "Got it! We'll send you a notification at " + str(Time) + " on " + str(Date) + "!"
    
    content = {}
    content['Events'] = Events
    content['Time'] = Time
    content['Date'] = Date
    content['user'] = userId
    
    total = es.count(index="reminder", body={"query":  {"match_all": {}}})
    # print(total,'total')
    total = total['count']
    
    res = es.create(index = 'reminder', body = content, id = total+1)
    # res = es.index(index = 'reminder', body = content)
    # print(res)

    return close('Fulfilled',
                 {'contentType': 'PlainText',
                  'content': message})





