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
table = dynamodb.Table('musiic')

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
	url = 'http://ws.audioscrobbler.com/2.0'
	name = event['currentIntent']['slots']['Name']
	user_id = event['userId']
	param = {'method': 'artist.gettoptracks', 'artist': name, 'api_key': 'd442483aba0c12a4efce7f3f7c7ce504', 'format': 'json'}
	r = requests.get(url, params = param)
	res = r.json()['toptracks']['track']
	message = 'Here are the recommended: '
	num = 0
	for i in range(len(res)):
		content = {}
		content['user'] = user_id
		content['Artist'] = res[i]['artist']['name']
		content['Name'] = res[i]['name']
		content['url'] = res[i]['url']
		content['Preference'] = 2
		content['db_id'] = str(time.time())
		# total = es.search(index = "music", body = {"query": {"match_all":{}}})
		# print(total)
		search = es.count(index="music", body={"query":  {"bool":{ "must": [{"match": {"Artist": content['Artist']}}, {"match": {"user": content["user"]}}, {"match": {"Name": content['Name']}}]}}})
		# print(search)
		if search['count'] != 0:
			continue
		num += 1
		es.index(index='music', body = content)
		content['playcount'] = res[i]['playcount']
		content['listeners'] = res[i]['listeners']
		if res[i]['image']:
			content['image'] = res[i]['image'][0]['#text']
		content['_id'] = content['db_id']
		del content['db_id']
		response = table.put_item(Item=content)
		
		message += 'No.' + str(num) + ': Track Name: ' + str(content['Name']) + ' URL: '+ str(content['url']) + ' '
		if num >= 3:
			break
	# print(response)
	return close('Fulfilled', {'contentType': 'PlainText', 'content': message})
