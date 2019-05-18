from __future__ import print_function
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
from datetime import datetime
import sys
import urllib
import time


sqs = boto3.client('sqs')
sqsurl = 'https://sqs.us-east-1.amazonaws.com/746588919426/proj'

def lambda_handler(content, context):
    message = sqs.receive_message(QueueUrl=sqsurl)
    print(message)
    sns_client = boto3.client('sns')
    if "Messages" in message:
        message = message['Messages'][0]
        print(message)
        jsonmsg = json.loads(message['Body'])
        
        PhoneNumber = jsonmsg['Phone']
        total = int(jsonmsg['total'])
        resmsg = "Here's all your records!"
        for i in range(total):
            resmsg += ' Event ' + str(i+1) + ': ' + jsonmsg['Events'][i] + ' at ' + jsonmsg['Time'][i] + ' on ' + jsonmsg['Date'][i]
        print(resmsg)
        # sns_client = boto3.client('sns')
        result = sns_client.publish(
                PhoneNumber = '+1' + PhoneNumber,
                Message=resmsg
                )
                
        print(result)
        print("final success")
        # else:
        #     sns_client.publish(
        #         PhoneNumber = '+1' + PhoneNumber,
        #         Message='Sorry, we fail to get the result. Please try again with the appropriate period!'
        #         )
            
        # next, we delete the message from the queue so no one else will process it again
        # sqs.delete_message(QueueUrl=sqsurl, ReceiptHandle=message['ReceiptHandle'])
    else:
        print('no message')