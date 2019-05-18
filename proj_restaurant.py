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
dynamodb = boto3.resource('dynamodb', region_name=region)
table = dynamodb.Table('restaurants')

es = Elasticsearch(['https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com:443'])
""" --- Helpers to build responses which match the structure of the necessary dialog actions --- """

class DecimalEncoder(json.JSONEncoder):

    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if abs(o) % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

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


def book_restaurant(intent_request):
    userId = intent_request["userId"]
    Location = get_slots(intent_request)["Location"]
    Cuisine = get_slots(intent_request)["Cuisine"]
    # call yelp api and get three restaurants #
    message = 'Thanks for waiting! Here are the recommended ' + str(Cuisine) + ' restaurants based on your description.'

    try:
        count = es.count(index="restaurants", body={"query":  {"bool": {"must" :[{"match": {"user":userId}}, {"match":{"Cuisine":Cuisine}},{"match":{"City":Location}}]}}})
        count = count['count']
    except:
        count = 0
    print(count)
    url = 'https://api.yelp.com/v3/businesses/search?term=food&location='+str(Location)+'&categories='+str(Cuisine)+'&sort_by=best_match&limit=3&offset=' + str(count+1)
    h = {'Authorization': 'Bearer jMl4MmpTag7jlzckSaLO2zgE5RTUtZ0cfOPCJSJJmwvnlcGFkKpWco7UYaKLXoU7laSeUC4ioBSCDE5xm7Q3FcvxTdNF26Z6kx7PuUO0qOtuawy10EEf-vScRkeEXHYx'}
    response = requests.get(url, headers=h)
    response = json.loads(response.text)
    total = es.count(index="restaurants", body={"query":  {"match_all": {}}})
    total = total['count']
    if len(response['businesses']) == 0:
        message = 'Sorry, there are no available restaurants'
    else:
        for i,res in enumerate(response['businesses']):
            content = {}
            content['Name'] = res['name']
            content['user'] = userId
            content["Cuisine"] = Cuisine
            content["City"] = Location
            content["Preference"] = 2
            content['db_id'] = str(time.time())
            try:
                es.create(index = 'restaurants', body = content, id = total+1)
            except Exception as err:
                return close('Fulfilled',
                 {'contentType': 'PlainText',
                  'content': str(err)})
    
            # es_url = 'https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com/restaurants/Restaurants/' + str(total+1)
            # r = requests.put(es_url, data = content)
            content["businessesId"] = res['id']
            content["Address"] = res['location']['address1']
            content['Rating'] = Decimal(res['rating'])
            content['_id'] = content['db_id']
            del content['db_id']
            total += 1
            # print(content)
            response = table.put_item(Item=content)
            print(json.dumps(response, indent=4, cls=DecimalEncoder))

        
        
            message += str(i+1) + ': ' + content['Name'] + 'Address: ' + content["Address"] + ' \n' 
        

    return close('Fulfilled',
                 {'contentType': 'PlainText',
                  'content': message})
    

""" --- Intents --- """


def dispatch(intent_request):

    logger.debug('dispatch userId={}, intentName={}'.format(intent_request['userId'], intent_request['currentIntent']['name']))

    intent_name = intent_request['currentIntent']['name']

    # Dispatch to your bot's intent handlers
    if intent_name == 'RestaurantIntent':
        return book_restaurant(intent_request)

    raise Exception('Intent with name ' + intent_name + ' not supported')


""" --- Main handler --- """


def lambda_handler(event, context):
    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    logger.debug('event.bot.name={}'.format(event['bot']['name']))
    return dispatch(event)
