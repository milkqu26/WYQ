import json
import re
import jieba
import wordcloud
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup

#获取搜索页面url
def get_next_video_url(search_url):
    # 发送GET请求获取搜索页面内容
    response = requests.get(search_url)
    if response.status_code == 200:
        html_content = response.content

        # 解析HTML内容
        soup = BeautifulSoup(html_content, 'html.parser')

        # 查找视频链接元素
        video_link_element = soup.select_one('.ajax-render')

        if video_link_element:
            # 获取视频链接
            video_url = video_link_element['href']
            return video_url
#获取cid号
def get_cid_from_url(video_url):
    # 从URL中提取BV号
    bv_match = re.search(r"(BV\w+)", video_url)
    if bv_match:
        bv_number = bv_match.group(1)

        # 构造API请求URL
        api_url = f"https://api.bilibili.com/x/player/pagelist?bvid={bv_number}"

        # 发送GET请求获取API响应
        response = requests.get(api_url)
        if response.status_code == 200:
            # 解析API响应JSON数据
            json_data = response.json()

            # 获取第一个视频的cid号
            if 'data' in json_data and len(json_data['data']) > 0:
                cid = json_data['data'][0]['cid']
                return cid

    return None



#生成词云图
def Word_cloud():
    f = open('danmaku.txt', encoding='utf-8')
    text = f.read()
    print(text)

    # 2. 分词 把一句话 分割成很多词汇
    text_list = jieba.lcut(text)
    print(text_list)
    # 列表转成字符串
    text_str = ' '.join(text_list)
    print(text_str)

    # 3.词云图配置
    # img = imageio.read('小测.png')
    wc = wordcloud.WordCloud(
        width=700,
        height=700,
        background_color='white',
        font_path='msyh.ttc',  # 字体文件：微软雅黑
        # mask = img,
        # 设置 停用词
        stopwords={'的', '了','\n'}
    )
    wc.generate(text_str)
    wc.to_file('词云图.png')

#提取和保存弹幕
def save_bilibili_danmaku(cid,save_path):
    # 构建获取弹幕数据的API链接
    api_url = f"https://comment.bilibili.com/{cid}.xml"

    # 发送GET请求获取弹幕数据
    response = requests.get(api_url)
    if response.status_code == 200:
        danmaku_content = response.content.decode('utf-8')

        # 解析XML格式的弹幕数据
        root = ET.fromstring(danmaku_content)
        danmaku_list = []
        for d in root.findall('d'):
            danmaku_list.append(d.text)

        # 将弹幕数据保存到文件
        with open(save_path, 'w', encoding='utf-8') as f:
            for danmaku in danmaku_list:
                f.write(danmaku + '\n')

        print(f"Danmaku data has been saved to {save_path}")
    else:
        print("Failed to get the danmaku data.")


# 设置搜索关键词
#search_keyword = "日本核污染水排海"
# 获取搜索页面的URL
#search_url = get_bilibili_search_url(search_keyword)
#search_url = 'https://search.bilibili.com/video?vt=93795829&keyword=%E6%97%A5%E6%9C%AC%E6%A0%B8%E6%B1%A1%E6%9F%93%E6%B0%B4%E6%8E%92%E6%B5%B7'

# 输入B站搜索页面的URL
search_url = "https://search.bilibili.com/video?vt=93795829&keyword=%E6%97%A5%E6%9C%AC%E6%A0%B8%E6%B1%A1%E6%9F%93%E6%B0%B4%E6%8E%92%E6%B5%B7"

# 获取下一个视频的URL链接
next_video_url = get_next_video_url(search_url)
if next_video_url:
    print(f"The URL of the next video is: {next_video_url}")
else:
    print("Failed to get the URL of the next video.")
# 获取视频的cid号
cid = get_cid_from_url(next_video_url)
if cid:
    print(f"The CID of the video is: {cid}")
else:
    print("Failed to get the CID of the video.")
print(cid)
save_path = "danmaku.txt"
save_bilibili_danmaku(cid,save_path)
Word_cloud()