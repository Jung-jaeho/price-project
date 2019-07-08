import requests
import uuid

LIM = 15

URL = 'https://www.daangn.com/api/v21/articles.json?filter=user_categories&include=first_image%2Cuser&limit=' + \
    str(LIM)+'&range=range1&region_id=73'

UUID = uuid.uuid4()

headers = {'accept': '*/*',
           'x-user-agent': 'TowneersApp/5.0.4/50400 iOS/12.3.1/1575.13 iPhone9,3',
           'x-device-identity': str('5F4C8F60-A6FF-4FD4-9D4D-D563719D4729'),
           'if-none-match': 'W/"c93740724cfc845b723741a1bd02930b"',
           'user-agent': 'daangn/5.0.4 (com.towneers.www; build:50400; iOS 12.3.1) Alamofire/4.5.0',
           'accept-language': 'ko-KR;q=1.0, en-KR;q=0.9, ja-KR;q=0.8, zh-Hans-KR;q=0.7, en-GB;q=0.6, en-AU;q=0.5',
           'accept-encoding': 'gzip;q=1.0, compress;q=0.5'}

cookies = {'_hoian-webapp_session': 'S1BXTzQ2cDRlaWVCMVZVdkZZNnNjNzhZWTczTktYVDdtWkJEUlFaOHZ4QzR5aW1ReWtrV283VEFBME5DR0JURkhGU0hoZ0J0VmFET2J4N3pTTUhXNGc9PS0tRGFGRTZiT1U3RktPMXA0K1dUY25TQT09--bd97f721dffa476bd71cf52c53940f697f03b257'}

res = requests.get(URL, headers=headers, cookies=cookies)

status = res.status_code
text = res.json()

for i in range(LIM):
    title = text['articles'][i]['title']
    created_at = text['articles'][i]['created_at']
    category_name = text['articles'][i]['category_name']
    price = text['articles'][i]['price']
    display_region_name = text['articles'][i]['display_region_name']
    content = text['articles'][i]['content']
    first_image = text['articles'][i]['first_image']['file']

    print('title:', title)
    print('created_at:', created_at)
    # print('content', content)
