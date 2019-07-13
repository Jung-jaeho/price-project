import requests
import uuid
import pymysql
import time
import datetime
import argparse
import sys
import random

dfeault_limit = 15

"""
CREATE TABLE articles (
  id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  site_name varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  article_id varchar(255) NOT NULL,
  article_url varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  title varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,
  content longtext COLLATE utf8mb4_unicode_ci,
  price varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  image varchar(255) COLLATE utf8mb4_unicode_ci,
  published_at datetime NOT NULL,
  crawled_at datetime NOT NULL,
  PRIMARY KEY (id)
)CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


def insert(curs, data):
    try:
        sql = """insert into articles(site_name, article_id, article_url, title, content, price, image, published_at, crawled_at)
                        values (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""

        curs.execute(sql, (data['site_name'], data['article_id'], data['article_url'], data['title'], data['content'],
                           data['price'], data['image'], data['published_at'], data['crawled_at']))
        conn.commit()

    except:
        print("==========")
        print("Fail")
        print("ID: "+str(data['article_id']))
        print("URL: "+str(data['article_url']))
        print("TITLE: "+str(data['title']))
        print("==========")


def daangn(api, headers, cookies, curs, args):
    count = 0
    next_max_published_at_f = ""

    while True:
        # 5초 딜레이
        time.sleep(random.randrange(3, 10))
        # default
        if count == 0 and args.lasts == "false":
            api = api

        elif count != 1 and args.lasts == "false":
            api = "https://www.daangn.com/api/v21/articles.json?filter=user_categories&include=first_image%2Cuser&limit=15&max_published_at_f=" + \
                str(next_max_published_at_f)+"&range=range3&region_id=6086"

        elif count == 0 and args.lasts == "true":
            sql = "SELECT published_at FROM articles WHERE site_name='daangn' ORDER BY published_at ASC limit 1"
            curs.execute(sql)
            rows = curs.fetchall()

            next_max_published_at_f = time.mktime(rows[0][0].timetuple())

            api = "https://www.daangn.com/api/v21/articles.json?filter=user_categories&include=first_image%2Cuser&limit=15&max_published_at_f=" + \
                str(next_max_published_at_f)+"&range=range3&region_id=6086"

        res = requests.get(api, headers=headers, cookies=cookies)

        if(res.status_code == 200):
            count = count + 1

            print("Scueess: 당근 마켓 {} 페이지 Load".format(count))
            json = res.json()
            print("Scueess: 당근 마켓 {} 컨텐츠 Load".format(len(json['articles'])))

            # default site name
            site_name = "daangn"

            # 다음 컨텐츠를 시간 단위로 가져옴
            next_max_published_at_f = json['meta']['max_published_at_f']

            for i in range(len(json['articles'])):
                data = {}

                article_id = json['articles'][i]['id']
                article_url = json['articles'][i]['permalink']
                title = json['articles'][i]['title']
                content = json['articles'][i]['content']
                price = json['articles'][i]['price']

                try:
                    image = json['articles'][i]['first_image']['file']
                except:
                    image = "default.jpg"

                published_at = datetime.datetime.strptime(
                    json['articles'][i]['published_at'],  '%Y-%m-%dT%H:%M:%S.%f%z').strftime('%Y-%m-%d %H:%M:%S')
                crawled_at = time.strftime('%Y-%m-%d %H:%M:%S')

                data['site_name'] = site_name
                data['article_id'] = article_id
                data['article_url'] = article_url
                data['title'] = title
                data['content'] = content
                data['price'] = price
                data['image'] = image
                data['published_at'] = published_at
                data['crawled_at'] = crawled_at

                """ 데이터베이스에 Insert """
                insert(curs, data)

        """ 프로그램 종료 """
        if(len(json['articles']) < 15):
            print("# ======================= 컨텐츠 부족")
            sys.exit(1)


def bunjang(headers, cookies, curs, args):

    page = 0

    while True:
        api = "https://core-api.bunjang.co.kr/api/1/find_v2.json?enable_redirect=1&f_location%5B%5D=37.555122%2C127.075837%2C10km&order=date&page=" + \
            str(page)+"&req_ref=neighborhood&request_id=20190712202933&stat_device=i&stat_tc_required=1&stat_uid=9359949&token=7fd234a3fc8b44d394fb72d3cb93555b&version=4"
        # api = "https://core-api.bunjang.co.kr/api/1/find_v2.json?f_flag=recommend3&f_location[]=37.545249,127.072822,100km&page=" + \
        #     str(page)+"&req_ref=recommend&request_id=20190712135038"

        # 5초 딜레이
        time.sleep(5)

        res = requests.get(api, headers=headers, cookies=cookies)

        if(res.status_code == 200):

            json = res.json()
            data = {}

            for i in range(len(json['list'])):
                site_name = 'bunjang'
                article_id = json['list'][i]['pid']
                article_url = "https://m.bunjang.co.kr/products/"+article_id+"?ref=홈"
                title = json['list'][i]['name']
                try:
                    content = requests.get('https://core-api.bunjang.co.kr/api/1/product/'+article_id +
                                           '/detail_info.json', headers=headers, cookies=cookies).json()['item_info']['description']
                except:
                    content = ""

                price = json['list'][i]['price']

                try:
                    image = json['list'][i]['product_image']
                except:
                    image = "default.jpg"

                published_at = time.strftime(
                    '%Y-%m-%d %H:%M:%S', time.localtime(int(json['list'][i]['update_time'])))
                crawled_at = time.strftime('%Y-%m-%d %H:%M:%S')

                data['site_name'] = site_name
                data['article_id'] = article_id
                data['article_url'] = article_url
                data['title'] = title
                data['content'] = content
                data['price'] = price
                data['image'] = image
                data['published_at'] = published_at
                data['crawled_at'] = crawled_at

                """ 데이터베이스에 Insert """
                insert(curs, data)

            print("API: "+str(api))
            print("PAGE: "+str(page))

            page = page + 1

            """ 프로그램 종료 """
            if(len(json['list']) < 15):
                print(len(json['list']))
                print("# ======================= 컨텐츠 부족")
                sys.exit(1)

        else:
            print("# ======================= 접속 문제")
            sys.exit(1)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--lasts', required=True, help='true or false')
    parser.add_argument('--mode', required=True, help='true or false')

    args = parser.parse_args()

    daangn_api = "https://www.daangn.com/api/v21/articles.json?filter=user_categories&include=first_image%2Cuser&limit=15&range=range3&region_id=6086"

    conn = pymysql.connect(host='203.250.148.108', port=53306, user='guest', password='ssg@)!(',
                           db='price', charset='utf8mb4', )

    # conn = pymysql.connect(host='127.0.0.1',  user='root',
    #                        password='sejongssg!@#', db='price', charset='utf8mb4', )

    curs = conn.cursor()

    if args.mode == "daangn":
        # 당근 마켓 함수 호출
        daangn_headers = {'accept': '*/*',
                          'x-user-agent': 'TowneersApp/5.0.4/50400 iOS/12.3.1/1575.13 iPhone9,3',
                          'x-device-identity': str('5F4C8F60-A6FF-4FD4-9D4D-D563719D4729'),
                          'if-none-match': 'W/"c93740724cfc845b723741a1bd02930b"',
                          'user-agent': 'daangn/5.0.4 (com.towneers.www; build:50400; iOS 12.3.1) Alamofire/4.5.0',
                          'accept-language': 'ko-KR;q=1.0, en-KR;q=0.9, ja-KR;q=0.8, zh-Hans-KR;q=0.7, en-GB;q=0.6, en-AU;q=0.5',
                          'accept-encoding': 'gzip;q=1.0, compress;q=0.5'}
        daangn_cookies = {'_hoian-webapp_session': 'S1BXTzQ2cDRlaWVCMVZVdkZZNnNjNzhZWTczTktYVDdtWkJEUlFaOHZ4QzR5aW1ReWtrV283VEFBME5DR0JURkhGU0hoZ0J0VmFET2J4N3pTTUhXNGc9PS0tRGFGRTZiT1U3RktPMXA0K1dUY25TQT09--bd97f721dffa476bd71cf52c53940f697f03b257'}

        daangn(daangn_api, daangn_headers, daangn_cookies, curs, args)

    if args.mode == "bunjang":
        # 번개 장터 함수 호출
        bunjang_headers = {
            'accept': '*/*',
            'user-agent': 'Quicket/4.9.2 (iPhone; iOS 11.3.1; Scale/2.00)',
            'accept-language': 'ko-KR;q=1, en-KR;q=0.9',
            'accept-encoding': 'br,gzip,deflate'}
        bunjang_cookies = {
            'bunny_cookie=': 'ioqxg7iysxzt3232sysn88qmjaggnmck', '_ga': 'GA1.3.1198344394.1562812994'}

        bunjang(bunjang_headers, bunjang_cookies, curs, args)

    # DB connection 종료
    conn.close()
