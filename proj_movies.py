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
table = dynamodb.Table('movies')

es = Elasticsearch(['https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com:443'])
""" --- Helpers to build responses which match the structure of the necessary dialog actions --- """
dic = {'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35, 'crime': 80, 'documentary': 99, 'drama': 18, 'family': 10751, 'fantasy': 14, 'history': 36, 'horror': 27, 'music': 10402, 'mystery': 9648, 'romance': 10749, 'science fiction': 878, 'tv movie': 10770, 'thriller': 53, 'war': 10752, 'western': 37}
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



def lambda_handler(event, context):

	userId = event["userId"]
	genre = get_slots(event)["Type"].lower()
	if genre not in dic:
		message = 'Sorry, the genre is invalid'
		return close('Fulfilled',
				 {'contentType': 'PlainText',
				  'content': message})
	# call yelp api and get three restaurants #
	message = 'Thanks for waiting! Here are the recommended ' + str(genre) + ' movies as your will.'
	num = 0
	page = 1
	while num < 3:
		url = 'https://api.themoviedb.org/3/discover/movie?api_key=b05a13fc847c0bbb2c0f853b8b87baf7&page=' + str(page) + '&with_genres=' + str(dic[genre])
		response = requests.get(url)
		response = json.loads(response.text)
		if len(response['results']) == 0:
			message = 'Sorry, there are no available restaurants'
			break
		else:
			for i,res in enumerate(response['results']):
				content = {}
				content['Name'] = res['original_title']
				content['user'] = userId
				content['Genre'] = genre
				content["Preference"] = 2
				content["MovieId"] = str(res['id'])
				content['db_id'] = str(time.time())
				search = es.count(index="movies", body={"query":  {"bool":{ "must": [{"term": {"Genre": genre}},{"match":{"user":userId}},{"term":{'MovieId': content["MovieId"]}}]}}})
				# search = es.count(index="movies", body={"query":  {"multi_match": {"Genre": genre, "userId":userId, 'Name': content['Name'], 'MovieId': content["MovieId"]}}})
				# search = es.count(index="movies", body={"query":  {"bool":{ "must": [{"term": {"Genre": genre}},{"term":{"user":userId}}, {"term":{'Name': content['Name']}}, {"term":{'MovieId': content["MovieId"]}}]}}})
				print(search)
				if int(search['count']) == 0:
					# es_url = 'https://search-proj-s32olh4w37jhobjg6e45qcm6ca.us-east-1.es.amazonaws.com/movies/Movies' + str(total+1)
					# r = requests.put(es_url, data = content)
					result = es.index(index = 'movies', body = content)
					content["Release_date"] = res['release_date']
					content["Popularity"] = Decimal(str(res['popularity']))
					content['Overview'] = res['overview']
					content['Rating'] = Decimal(str(res['vote_average']))
					content['Poster'] = res["poster_path"]
					content['_id'] = content['db_id']
					del content['db_id']
					print(content)
					response = table.put_item(Item=content)
					print(json.dumps(response, indent=4, cls=DecimalEncoder))
					message += str(num+1) + ': ' + content['Name'] + ' Rating: ' + str(content["Rating"]) + '\n' 
					num += 1
				if num >= 3:
					break
			page += 1
	return close('Fulfilled',
				 {'contentType': 'PlainText',
				  'content': message})
	
	
