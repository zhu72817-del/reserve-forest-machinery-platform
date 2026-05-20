#!/usr/bin/env python3
import json
import os
import secrets
import sqlite3
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("PLATFORM_DB_PATH", ROOT / "data" / "platform.db"))
SESSIONS = {}

USERS = [
    ("superadmin", "123456", "超级管理员", "系统管理中心", "admin"),
    ("manager", "123456", "平台管理员", "中国林业物资有限公司", "admin"),
    ("chenyx", "123456", "权限管理员", "中国林业物资有限公司", "admin"),
    ("zhuk", "123456", "超级管理员", "中林集团", "admin"),
    ("buyer", "123456", "采购人", "雷林储备林公司", "buyer"),
    ("supplier", "123456", "供应商", "华南林机服务商", "supplier"),
    ("admin", "123456", "管理员", "中国林业物资有限公司", "admin"),
]

SUPPLIERS = [
    ("S-1001", "山地林机联合服务商", "机械作业服务供应商", "重庆", "轨道式集材、山地运输、机械化采伐", "统筹分签,可跨区域服务", 4.8, "审核通过"),
    ("S-1002", "大疆授权渠道", "无人机供应商", "集团统筹", "巡查无人机、行业无人机、培训维保", "集团内采,集采供应商", 4.9, "审核通过"),
    ("S-1003", "应急装备供应中心", "森林防火装备供应商", "雷林", "防火车辆、水泵、风力灭火机、防护装备", "优质供应商,紧急响应", 4.7, "审核通过"),
    ("S-1004", "华南林机服务商", "机械服务供应商", "广西", "营林抚育、设备租赁、履约服务", "区域服务商,长期合作", 4.6, "待审核"),
]

ITEMS = [
    ("I-FE-001", "风力灭火机 XG25-F", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "用于森林火灾初期扑救、林区巡护保障和应急处置。", "上架", "XG25-F", "4冲程发动机；排量79.9cm3；功率3.2kW；最大风量2025m3/h；最大风速105m/s；有效灭火距离1.85m。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-002", "便携式灭火水泵 XGB2-80M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "便携式林区取水、供水和初期火情处置水泵。", "上架", "XGB2-80M", "单缸四冲程风冷汽油机；最大扬程80m；重量15kg；功率1.6kW；射程22m；最大压力0.8MPa；最大流量3L/s。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-003", "背负式森林消防水泵 XGB8-170M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "适合山地林区背负携行、远距离取水和接力灭火。", "上架", "XGB8-170M", "离心式水泵；最大扬程170m；重量14.5kg；最大流量5.8L/s；入口2英寸；出口1.5英寸；最大射程30m。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-004", "智能型森林消防高压接力水泵 XGB12-260M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "适用于高压接力供水、山地远距离灭火和连续作业。", "上架", "XGB12-260M", "13.5HP；吸水深度7m；最大压力2.60MPa；射程35.1m；排量150cc；最大扬程260m；最大流量321L/min。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-005", "手抬式大流量消防水泵 XGB20-270M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "用于林区大流量供水、火场接力供水和应急灭火。", "上架", "XGB20-270M", "四冲程水冷汽油机；功率20hp；四级离心泵；电启动；最大扬程260m；最大流量350L/min；最大射程35m。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-006", "远程高压消防火泵 XGB23-350M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "适合远程高压供水和复杂水质环境下的森林火灾处置。", "上架", "XGB23-350M", "发动机功率23hp；最大流量440L/min；手拉/电启动；四级离心泵；双缸风冷；具备机械式和手动引水。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-007", "远程高压消防水泵 XGB35-420M", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "用于高扬程、高压力远程供水和串并联架设作业。", "上架", "XGB35-420M", "最大流量442L/min；最大压力4.2MPa；最大扬程420m；最大射程42m；整机净质量110kg；进水口50mm、出水口40mm。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-008", "油锯 XGJ-66", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "用于林木采伐、枝干切割、防火隔离带清理和应急清障。", "上架", "XGJ-66", "排量>90.0cm3；常温启动<=6s；锯切效率>=110cm2/s；净重量<=7.5kg；满负荷噪音<105dB(A)。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-FE-009", "森林防火服 XGF01", "内采商城", "森林防火装备", "集团统筹", "中国林业物资有限公司", "协议价", "用于森林防火巡护、扑救和应急处置人员防护。", "上架", "XGF01", "符合GB/T33536-2017；永久阻燃高强度芳纶纤维面料；洗涤50次后续燃时间<=0s；单位面积质量<=208g/m2。", "森林防火、巡护保障、应急处置", "宣传册防火设备"),
    ("I-VH-001", "福特/江铃指挥巡逻车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于巡护通勤、装备搭载和应急保障。", "上架", "JX5022TXUP6 / JX5027TXUP6", "汽油；尺寸4630*1935*1706或4905*1930*1755mm；轴距2726/2865mm；额定载客5或5/6座；最高时速180/195km/h。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-002", "风度牌巡逻车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "适用于林区巡护、应急通勤和装备随车携行。", "上架", "ZN5030TXUW2B6A", "汽油；尺寸4882*1850*1875mm；轴距2850mm；功率1997/168；额定载客5；最高时速160km/h。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-003", "风度牌指挥车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于火场前指、巡护指挥、现场通信和应急保障。", "上架", "ZN5030XZHWBB6A", "汽油；尺寸4882*1850*2170mm；轴距2850mm；功率1997/168；额定载客5；最高时速160km/h。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-004", "依维柯运兵车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于森林防火队伍快速机动、人员转运和应急保障。", "上架", "NJ5046XYBFA", "南京依维柯；发动机SOFIM8140.43$6；国六；排量和功率2798/95；前/后轮距1695/1540mm。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-005", "福田牌运兵车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于防火队伍运兵、装备搭载和应急任务保障。", "上架", "BJ5048XYB-E1", "北汽福田；发动机康明斯F2.8NS6B177L；国VI；排量和功率2780/130；前/后轮距1740/1704mm。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-006", "江铃牌柴油森林防火工具车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于森林防火工具、应急装备和巡护人员搭载。", "上架", "JX1035TS0A6", "柴油；尺寸5335*1882*1792mm；轴距3150mm；功率2478/118；额定载客5；最高时速160km/h；四驱系统。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("I-VH-007", "坦克300森林防火指挥车基型车", "内采商城", "车辆装备", "集团统筹", "中国林业物资有限公司", "面议", "用于复杂道路巡护指挥、应急通信和现场保障。", "上架", "E20CB", "汽油；尺寸4750*1930*1903mm；轴距2750mm；功率167kW；座位数5；最小离地间隙224mm；9挡手自一体。", "巡护通勤、装备搭载、应急保障", "宣传册车辆产品"),
    ("EQ-3001", "履带式挖掘机", "机械设备", "土地整理设备", "广西", "中林机械租赁服务有限公司", "购买面议 / 600元/小时", "林地整理、道路修整、开沟、土方作业，可购买可租赁。", "上架", "履带式", "购买价面议；租赁参考600元/小时；支持台班租赁。", "林地整理、道路修整、开沟", "机械设备库"),
    ("EQ-3002", "小型挖掘机", "机械设备", "土地整理设备", "雷林", "雷州营林工程队", "购买面议 / 480元/小时", "适用于林下空间、窄路地块和小规模整地作业。", "上架", "小型挖掘机", "购买价面议；租赁参考480元/小时；适合窄路地块。", "林下整地、小规模施工", "机械设备库"),
    ("EQ-3003", "装载机", "机械设备", "运输设备", "广西", "广西林业装备服务有限公司", "按台班计价", "土石方装载、木材装卸、道路维护，可购买可租赁。", "上架", "装载机", "支持购买、租赁和带司机作业。", "木材装卸、道路维护、土方装载", "机械设备库"),
    ("EQ-3004", "轨道式集材系统", "机械设备", "采伐集材设备", "重庆", "山地林机联合服务商", "按项目报价", "适用于坡度30度以下山地木材集材和短驳运输。", "上架", "山地轨道集材系统", "按坡度、运距、木材方量和安装周期报价。", "山地集材、木材短驳", "机械设备库"),
    ("EQ-3005", "山地运输车", "机械设备", "运输设备", "重庆", "山地林机联合服务商", "购买面议 / 900元/台班", "复杂山地林区木材、物资和人员短途运输。", "上架", "山地运输车", "购买价面议；租赁参考900元/台班。", "山地运输、物资短驳", "机械设备库"),
    ("EQ-3006", "大型运输无人机", "机械设备", "无人机设备", "重庆", "华南无人机应用服务有限公司", "按项目报价", "山地木材、物资和应急装备低空运输。", "上架", "大型运输无人机", "按载重、航线、距离和作业频次报价。", "低空运输、应急投送", "机械设备库"),
    ("SVC-2001", "林地整理服务", "机械化服务", "机械化作业服务", "雷林", "雷州营林工程队", "1200元/亩起", "林地清理、整地、开沟、抚育配套机械化作业。", "上架", "", "每小时工程价格、台班价和亩价可按地形与面积核算。", "林地整理、开沟、清杂", "机械服务库"),
    ("SVC-2002", "机械化造林服务", "机械化服务", "机械化作业服务", "广西", "广西林业装备服务有限公司", "按项目报价", "造林整地、苗木栽植、补植补造和管护服务。", "上架", "", "按作业面积、苗木规格、地形和工期报价。", "造林整地、苗木栽植、管护", "机械服务库"),
    ("SVC-2003", "割灌除草服务", "机械化服务", "机械化作业服务", "广西", "华南林机服务商", "860元/亩起", "丘陵林地割灌、除草、抚育和道路协同管理。", "上架", "", "可按小时、亩数或项目报价。", "割灌除草、林木抚育", "机械服务库"),
    ("SVC-2004", "木材集材服务", "机械化服务", "采伐运输服务", "重庆", "山地林机联合服务商", "980元/立方米起", "轨道集材、绞盘集材、装车与短驳运输。", "上架", "", "按方量、坡度、运距和设备配置报价。", "木材集材、装车、短驳", "机械服务库"),
    ("SVC-2005", "无人机巡查服务", "无人机服务", "无人机应用服务", "集团统筹", "华南无人机应用服务有限公司", "按架次报价", "林地巡查、防火监测、影像回传和数据报告。", "上架", "", "可按架次、小时、天或项目报价。", "无人机巡查、防火监测、影像回传", "机械服务库"),
    ("SVC-2006", "设备租赁服务", "设备租赁服务", "设备租赁服务", "集团统筹", "中林机械租赁服务有限公司", "按台班计价", "挖掘机、装载机、履带运输车、割灌机等租赁。", "上架", "", "支持小时租赁、台班租赁和项目租赁。", "设备租赁、带人作业", "机械服务库"),
]

OBSOLETE_DEMO_ITEM_IDS = [
    "I-1001", "I-1002", "I-1003", "I-1004", "I-1005", "I-1006",
    "I-1007", "I-1008", "I-1009", "I-1010", "I-1011", "I-1012",
    "I-DR-001", "I-DR-002", "I-PM-001", "I-PM-002",
]

PRODUCT_IMAGES = {
    "I-FE-001": "assets/products/I-FE-001.jpg",
    "I-FE-002": "assets/products/I-FE-002.jpg",
    "I-FE-003": "assets/products/I-FE-003.jpg",
    "I-FE-004": "assets/products/I-FE-004.jpg",
    "I-FE-005": "assets/products/I-FE-005.jpg",
    "I-FE-006": "assets/products/I-FE-006.jpg",
    "I-FE-007": "assets/products/I-FE-007.jpg",
    "I-FE-008": "assets/products/I-FE-008.jpg",
    "I-FE-009": "assets/products/I-FE-009.jpg",
    "I-VH-001": "assets/products/I-VH-001.png",
    "I-VH-002": "assets/products/I-VH-002.png",
    "I-VH-003": "assets/products/I-VH-003.png",
    "I-VH-004": "assets/products/I-VH-004.png",
    "I-VH-005": "assets/products/I-VH-005.png",
    "I-VH-006": "assets/products/I-VH-006.png",
    "I-VH-007": "assets/products/I-VH-007.png",
    "EQ-3001": "https://commons.wikimedia.org/wiki/Special:FilePath/Caterpillar%20330%20excavator%20on%20a%20pile%20of%20dirt.jpg",
    "EQ-3002": "https://commons.wikimedia.org/wiki/Special:FilePath/Minibagger%20Bobcat%20331.jpg",
    "EQ-3003": "https://commons.wikimedia.org/wiki/Special:FilePath/Volvo%20L90F%20wheel%20loader.jpg",
    "EQ-3004": "https://commons.wikimedia.org/wiki/Special:FilePath/Skidder%20system%20of%20cable%20yarding%20%281978%29.jpg",
    "EQ-3005": "https://commons.wikimedia.org/wiki/Special:FilePath/Malwa%20460%20forwarder%20d.jpg",
    "EQ-3006": "https://commons.wikimedia.org/wiki/Special:FilePath/DJI%20Phantom%204%20Pro%20Drone.jpg",
    "SVC-2001": "https://commons.wikimedia.org/wiki/Special:FilePath/Forestry%20machine%20in%20Chase%20Wood%20-%20geograph.org.uk%20-%204091832.jpg",
    "SVC-2002": "https://commons.wikimedia.org/wiki/Special:FilePath/Tree%20planting%20with%20Pottiputki.jpg",
    "SVC-2003": "https://cdn.pixabay.com/photo/2016/06/09/18/49/daf-1440558_1280.jpg",
    "SVC-2004": "https://commons.wikimedia.org/wiki/Special:FilePath/Malwa%20460%20forwarder%20d.jpg",
    "SVC-2005": "https://commons.wikimedia.org/wiki/Special:FilePath/DJI%20Phantom%204%20Pro%20Drone.jpg",
    "SVC-2006": "https://commons.wikimedia.org/wiki/Special:FilePath/Caterpillar%20330%20excavator%20on%20a%20pile%20of%20dirt.jpg",
}

DEMANDS = [
    ("D-2401", "重庆山地木材运输服务", "重庆", "采伐机械", 460000, "竞价采购", "已匹配", "轨道式集材系统作业服务", "坡度约25度，项目节点紧，需要缩短采购周期。"),
    ("D-2402", "雷林防火车辆年度采购", "雷林", "森林防火装备", 820000, "协议供货", "待审核", "待管理员确认采购路径", "年初未纳入采购计划，需研究内部采购和合规补充路径。"),
    ("D-2403", "广西无人机巡查试点", "广西", "无人机", 260000, "网上超市", "已匹配", "大疆行业无人机巡查套装", "用于巡查、防火监测、作业数据采集。"),
]

ORDERS = [
    ("O-9001", "重庆山地木材运输服务", "山地林机联合服务商", 460000, "合同待确认"),
    ("O-9002", "广西无人机巡查试点", "大疆授权渠道", 260000, "待验收"),
]

QUOTES = [
    ("Q-3001", "D-2401", "山地林机联合服务商", 460000, "含现场踏勘、轨道布设、集材运输和撤场。", "已报价"),
    ("Q-3002", "D-2403", "大疆授权渠道", 260000, "含无人机、培训、维保和巡查方案。", "已报价"),
]

CONTRACTS = [
    ("C-9001", "O-9001", "机械服务合同", "重庆山地木材运输服务", "待确认"),
    ("C-9002", "O-9002", "无人机采购合同", "广西无人机巡查试点", "履约中"),
]

ANNOUNCEMENTS = [
    ("A-1001", "供应商入驻指南", "供应商需提交营业执照、资质证书、设备清单、服务区域和案例业绩。", "公告"),
    ("A-1002", "森林防火装备采购目录征集", "平台正在梳理防火车辆、风力灭火机、消防水泵、扑火服等标准目录。", "通知"),
    ("A-1003", "机械化服务采购流程说明", "项目单位可发布需求、发起询价、比选报价、生成订单并完成验收评价。", "指南"),
]


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              username TEXT PRIMARY KEY,
              password TEXT NOT NULL,
              role_name TEXT NOT NULL,
              org TEXT NOT NULL,
              role TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS items (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              channel TEXT NOT NULL,
              category TEXT NOT NULL,
              region TEXT NOT NULL,
              supplier TEXT NOT NULL,
              price TEXT NOT NULL,
              description TEXT NOT NULL,
              status TEXT NOT NULL,
              model TEXT NOT NULL DEFAULT '',
              specs TEXT NOT NULL DEFAULT '',
              scenario TEXT NOT NULL DEFAULT '',
              tags TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS suppliers (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              type TEXT NOT NULL,
              region TEXT NOT NULL,
              business TEXT NOT NULL,
              tags TEXT NOT NULL,
              score REAL NOT NULL,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS demands (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              region TEXT NOT NULL,
              category TEXT NOT NULL,
              budget INTEGER NOT NULL,
              method TEXT NOT NULL,
              status TEXT NOT NULL,
              matched TEXT NOT NULL,
              description TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS orders (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              supplier TEXT NOT NULL,
              amount INTEGER NOT NULL,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS quotes (
              id TEXT PRIMARY KEY,
              demand_id TEXT NOT NULL,
              supplier TEXT NOT NULL,
              amount INTEGER NOT NULL,
              plan TEXT NOT NULL,
              status TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS audit_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              actor TEXT NOT NULL,
              action TEXT NOT NULL,
              target TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS contracts (
              id TEXT PRIMARY KEY,
              order_id TEXT NOT NULL,
              type TEXT NOT NULL,
              title TEXT NOT NULL,
              status TEXT NOT NULL,
              buyer_org TEXT NOT NULL DEFAULT '',
              supplier TEXT NOT NULL DEFAULT '',
              contact TEXT NOT NULL DEFAULT '',
              address TEXT NOT NULL DEFAULT '',
              delivery_time TEXT NOT NULL DEFAULT '',
              amount_text TEXT NOT NULL DEFAULT '',
              payment_terms TEXT NOT NULL DEFAULT '',
              content TEXT NOT NULL DEFAULT '',
              flow_node TEXT NOT NULL DEFAULT '',
              remark TEXT NOT NULL DEFAULT '',
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS announcements (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              type TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        existing_columns = [row["name"] for row in conn.execute("PRAGMA table_info(items)").fetchall()]
        for column, ddl in {
            "model": "ALTER TABLE items ADD COLUMN model TEXT NOT NULL DEFAULT ''",
            "specs": "ALTER TABLE items ADD COLUMN specs TEXT NOT NULL DEFAULT ''",
            "scenario": "ALTER TABLE items ADD COLUMN scenario TEXT NOT NULL DEFAULT ''",
            "tags": "ALTER TABLE items ADD COLUMN tags TEXT NOT NULL DEFAULT ''",
        }.items():
            if column not in existing_columns:
                conn.execute(ddl)
        contract_columns = [row["name"] for row in conn.execute("PRAGMA table_info(contracts)").fetchall()]
        for column, ddl in {
            "buyer_org": "ALTER TABLE contracts ADD COLUMN buyer_org TEXT NOT NULL DEFAULT ''",
            "supplier": "ALTER TABLE contracts ADD COLUMN supplier TEXT NOT NULL DEFAULT ''",
            "contact": "ALTER TABLE contracts ADD COLUMN contact TEXT NOT NULL DEFAULT ''",
            "address": "ALTER TABLE contracts ADD COLUMN address TEXT NOT NULL DEFAULT ''",
            "delivery_time": "ALTER TABLE contracts ADD COLUMN delivery_time TEXT NOT NULL DEFAULT ''",
            "amount_text": "ALTER TABLE contracts ADD COLUMN amount_text TEXT NOT NULL DEFAULT ''",
            "payment_terms": "ALTER TABLE contracts ADD COLUMN payment_terms TEXT NOT NULL DEFAULT ''",
            "content": "ALTER TABLE contracts ADD COLUMN content TEXT NOT NULL DEFAULT ''",
            "flow_node": "ALTER TABLE contracts ADD COLUMN flow_node TEXT NOT NULL DEFAULT ''",
            "remark": "ALTER TABLE contracts ADD COLUMN remark TEXT NOT NULL DEFAULT ''",
        }.items():
            if column not in contract_columns:
                conn.execute(ddl)
        if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
            conn.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?)", USERS)
        for user in USERS:
            conn.execute("INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?)", user)
        for old_id in OBSOLETE_DEMO_ITEM_IDS:
            conn.execute("DELETE FROM items WHERE id = ?", (old_id,))
        conn.executemany("INSERT OR REPLACE INTO items (id, name, channel, category, region, supplier, price, description, status, model, specs, scenario, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ITEMS)
        if conn.execute("SELECT COUNT(*) FROM demands").fetchone()[0] == 0:
            conn.executemany("INSERT INTO demands (id, title, region, category, budget, method, status, matched, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", DEMANDS)
        if conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0] == 0:
            conn.executemany("INSERT INTO orders (id, title, supplier, amount, status) VALUES (?, ?, ?, ?, ?)", ORDERS)
        if conn.execute("SELECT COUNT(*) FROM quotes").fetchone()[0] == 0:
            conn.executemany("INSERT INTO quotes (id, demand_id, supplier, amount, plan, status) VALUES (?, ?, ?, ?, ?, ?)", QUOTES)
        if conn.execute("SELECT COUNT(*) FROM suppliers").fetchone()[0] == 0:
            conn.executemany("INSERT INTO suppliers (id, name, type, region, business, tags, score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", SUPPLIERS)
        if conn.execute("SELECT COUNT(*) FROM contracts").fetchone()[0] == 0:
            conn.executemany("INSERT INTO contracts (id, order_id, type, title, status) VALUES (?, ?, ?, ?, ?)", CONTRACTS)
        if conn.execute("SELECT COUNT(*) FROM announcements").fetchone()[0] == 0:
            conn.executemany("INSERT INTO announcements (id, title, content, type) VALUES (?, ?, ?, ?)", ANNOUNCEMENTS)


def reset_db():
    with connect() as conn:
        for table in ["users", "items", "demands", "orders", "quotes", "suppliers", "contracts", "announcements", "audit_logs"]:
            conn.execute(f"DELETE FROM {table}")
        conn.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?)", USERS)
        conn.executemany("INSERT INTO items (id, name, channel, category, region, supplier, price, description, status, model, specs, scenario, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", ITEMS)
        conn.executemany("INSERT INTO demands (id, title, region, category, budget, method, status, matched, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", DEMANDS)
        conn.executemany("INSERT INTO orders (id, title, supplier, amount, status) VALUES (?, ?, ?, ?, ?)", ORDERS)
        conn.executemany("INSERT INTO quotes (id, demand_id, supplier, amount, plan, status) VALUES (?, ?, ?, ?, ?, ?)", QUOTES)
        conn.executemany("INSERT INTO suppliers (id, name, type, region, business, tags, score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", SUPPLIERS)
        conn.executemany("INSERT INTO contracts (id, order_id, type, title, status) VALUES (?, ?, ?, ?, ?)", CONTRACTS)
        conn.executemany("INSERT INTO announcements (id, title, content, type) VALUES (?, ?, ?, ?)", ANNOUNCEMENTS)


def all_rows(table):
    with connect() as conn:
        return [dict(row) for row in conn.execute(f"SELECT * FROM {table} ORDER BY created_at DESC, id DESC")]


def attach_product_images(rows):
    enriched = []
    for row in rows:
        item = dict(row)
        item["image"] = PRODUCT_IMAGES.get(item.get("id"), "")
        enriched.append(item)
    return enriched


def write_log(actor, action, target):
    with connect() as conn:
        conn.execute("INSERT INTO audit_logs (actor, action, target) VALUES (?, ?, ?)", (actor, action, target))


def current_user(handler):
    header = handler.headers.get("Cookie", "")
    jar = cookies.SimpleCookie(header)
    sid = jar.get("sid")
    return SESSIONS.get(sid.value) if sid else None


def match_item(category, region):
    with connect() as conn:
        item = conn.execute(
            """
            SELECT name FROM items
            WHERE status = '上架' AND category = ? AND (region = ? OR region = '集团统筹')
            ORDER BY CASE WHEN region = ? THEN 0 ELSE 1 END, created_at DESC
            LIMIT 1
            """,
            (category, region, region),
        ).fetchone()
    return item["name"] if item else "待管理员确认采购路径"


def amount_to_int(value):
    digits = "".join([char for char in str(value or "") if char.isdigit()])
    return int(digits) if digits else 0


def contract_type_for(item, procurement_type):
    if "服务" in procurement_type or "服务" in item["channel"]:
        return "储备林机械服务合同"
    if "设备" in procurement_type:
        return "机械设备采购/租赁合同"
    return "内采商品采购合同"


def contract_type_for_method(method):
    if "服务" in method:
        return "储备林机械服务合同"
    if "租赁" in method:
        return "机械设备租赁合同"
    if "设备" in method:
        return "机械设备采购合同"
    return "采购合同"


def public_payload():
    items = attach_product_images([row for row in all_rows("items") if row["status"] == "上架"])
    mall_items = [
        item for item in items
        if item["channel"] == "内采商城" and item["category"] in {"森林防火装备", "车辆装备"} and item["id"] in PRODUCT_IMAGES
    ]
    equipment = [item for item in items if item["channel"] == "机械设备"]
    services = [item for item in items if "服务" in item["channel"] or "服务" in item["category"]]
    demands = all_rows("demands")
    suppliers = [row for row in all_rows("suppliers") if row["status"] == "审核通过"]
    return {
        "stats": {
            "suppliers": len(suppliers),
            "items": len(mall_items),
            "equipment": len(equipment),
            "services": len(services),
            "orders": len(all_rows("orders")),
            "regions": len(set([item["region"] for item in items] + [demand["region"] for demand in demands])),
            "drones": len([item for item in items if "无人机" in item["category"] or "无人机" in item["name"]]),
            "fire": len([item for item in items if item["category"] == "森林防火装备"]),
            "demands": len(demands),
        },
        "items": mall_items,
        "equipment": equipment[:6],
        "services": services[:6],
        "demands": demands[:6],
        "suppliers": suppliers[:6],
        "announcements": all_rows("announcements")[:6],
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def json(self, payload, status=200, extra_headers=None):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        length = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def user_or_401(self):
        user = current_user(self)
        if not user:
            self.json({"error": "未登录"}, 401)
        return user

    def require_role(self, *roles):
        user = self.user_or_401()
        if not user:
            return None
        if user["role"] not in roles:
            self.json({"error": "当前角色无权执行该操作"}, 403)
            return None
        return user

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.json({"ok": True, "service": "forest-machinery-platform"})
            return
        if path == "/api/me":
            self.json({"user": current_user(self)})
            return
        if path == "/api/public":
            self.json(public_payload())
            return
        if path == "/api/state":
            user = current_user(self)
            if not user:
                self.json({"error": "未登录"}, 401)
                return
            self.json({
                "user": user,
                "items": attach_product_images(all_rows("items")),
                "demands": all_rows("demands"),
                "orders": all_rows("orders"),
                "quotes": all_rows("quotes"),
                "suppliers": all_rows("suppliers"),
                "contracts": all_rows("contracts"),
                "announcements": all_rows("announcements"),
                "audit_logs": all_rows("audit_logs")[:30],
            })
            return
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        data = self.body()
        if path == "/api/login":
            with connect() as conn:
                row = conn.execute("SELECT username, role_name, org, role FROM users WHERE username = ? AND password = ?", (data.get("username"), data.get("password"))).fetchone()
            if not row:
                self.json({"error": "账号或密码错误"}, 401)
                return
            sid = secrets.token_urlsafe(24)
            SESSIONS[sid] = dict(row)
            self.json({"user": dict(row)}, extra_headers={"Set-Cookie": f"sid={sid}; Path=/; SameSite=Lax"})
            return
        if path == "/api/register_supplier":
            supplier_id = f"S-{secrets.randbelow(90000) + 10000}"
            username = data["username"]
            with connect() as conn:
                exists = conn.execute("SELECT username FROM users WHERE username = ?", (username,)).fetchone()
                if exists:
                    self.json({"error": "账号已存在"}, 409)
                    return
                conn.execute("INSERT INTO users VALUES (?, ?, '供应商', ?, 'supplier')", (username, data["password"], data["name"]))
                conn.execute(
                    "INSERT INTO suppliers (id, name, type, region, business, tags, score, status) VALUES (?, ?, ?, ?, ?, ?, 0, '待审核')",
                    (supplier_id, data["name"], data.get("type", "服务类供应商"), data.get("region", "集团统筹"), data.get("business", ""), "待审核"),
                )
            write_log(data["name"], "提交供应商入驻申请", data["name"])
            self.json({"ok": True, "id": supplier_id}, 201)
            return
        if path == "/api/logout":
            user = current_user(self)
            if user:
                for key, value in list(SESSIONS.items()):
                    if value == user:
                        SESSIONS.pop(key, None)
            self.json({"ok": True}, extra_headers={"Set-Cookie": "sid=; Path=/; Max-Age=0"})
            return
        if path == "/api/reset":
            user = self.require_role("admin")
            if not user:
                return
            reset_db()
            write_log(user["org"], "重置平台数据", "系统")
            self.json({"ok": True})
            return
        if path == "/api/items":
            user = self.require_role("supplier", "admin")
            if not user:
                return
            item_id = f"I-{secrets.randbelow(90000) + 10000}"
            with connect() as conn:
                conn.execute(
                    "INSERT INTO items (id, name, channel, category, region, supplier, price, description, status, model, specs, scenario, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '待审核', ?, ?, ?, ?)",
                    (item_id, data["name"], data["channel"], data["category"], data["region"], user["org"], data["price"], data.get("description", ""), data.get("model", ""), data.get("specs", ""), data.get("scenario", ""), data.get("tags", "")),
                )
            write_log(user["org"], "提交商品服务审核", data["name"])
            self.json({"ok": True, "id": item_id}, 201)
            return
        if path == "/api/demands":
            user = self.require_role("buyer", "admin")
            if not user:
                return
            demand_id = f"D-{secrets.randbelow(90000) + 10000}"
            matched = match_item(data["category"], data["region"])
            resource_methods = {"设备采购需求", "设备租赁需求", "机械服务需求"}
            is_resource_demand = data.get("method") in resource_methods or bool(data.get("source_item_id"))
            status = "报价中" if is_resource_demand else ("已匹配" if matched != "待管理员确认采购路径" else "待审核")
            matched_text = "已发布，等待库内供应商报价" if is_resource_demand else matched
            detail_parts = [
                data.get("description", ""),
                f"数量/作业面积：{data.get('quantity', '')}" if data.get("quantity") else "",
                f"交付/进场/开工时间：{data.get('delivery_time', '')}" if data.get("delivery_time") else "",
                f"使用场景/地形条件：{data.get('work_condition', '')}" if data.get("work_condition") else "",
                f"每小时工程价格参考：{data.get('hourly_price_ref', '')}" if data.get("hourly_price_ref") else "",
                data.get("need_operator", ""),
                data.get("need_transport", ""),
            ]
            description = "\n".join([part for part in detail_parts if part])
            with connect() as conn:
                conn.execute(
                    "INSERT INTO demands (id, title, region, category, budget, method, status, matched, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (demand_id, data["title"], data["region"], data["category"], int(data["budget"] or 0), data["method"], status, matched_text, description),
                )
            write_log(user["org"], "发布采购需求", data["title"])
            self.json({"ok": True, "id": demand_id}, 201)
            return
        if path == "/api/quotes":
            user = self.require_role("supplier", "admin")
            if not user:
                return
            quote_id = f"Q-{secrets.randbelow(90000) + 10000}"
            with connect() as conn:
                demand = conn.execute("SELECT title FROM demands WHERE id = ?", (data["demand_id"],)).fetchone()
                if not demand:
                    self.json({"error": "采购需求不存在"}, 404)
                    return
                conn.execute(
                    "INSERT INTO quotes (id, demand_id, supplier, amount, plan, status) VALUES (?, ?, ?, ?, ?, '已报价')",
                    (quote_id, data["demand_id"], user["org"], int(data["amount"]), data.get("plan", "")),
                )
            write_log(user["org"], "提交响应报价", demand["title"])
            self.json({"ok": True, "id": quote_id}, 201)
            return
        if path == "/api/orders":
            user = self.require_role("buyer", "admin")
            if not user:
                return
            order_id = f"O-{secrets.randbelow(90000) + 10000}"
            with connect() as conn:
                demand = conn.execute("SELECT * FROM demands WHERE id = ?", (data["demand_id"],)).fetchone()
                if not demand:
                    self.json({"error": "采购需求不存在"}, 404)
                    return
                quote = conn.execute(
                    "SELECT supplier, amount FROM quotes WHERE demand_id = ? ORDER BY amount ASC, created_at ASC LIMIT 1",
                    (data["demand_id"],),
                ).fetchone()
                supplier = quote["supplier"] if quote else demand["matched"]
                amount = quote["amount"] if quote else demand["budget"]
                conn.execute(
                    "INSERT INTO orders (id, title, supplier, amount, status) VALUES (?, ?, ?, ?, '合同待确认')",
                    (order_id, demand["title"], supplier, int(amount)),
                )
                contract_id = f"C-{secrets.randbelow(90000) + 10000}"
                conn.execute(
                    """
                    INSERT INTO contracts
                    (id, order_id, type, title, status, buyer_org, supplier, amount_text, content, flow_node, remark)
                    VALUES (?, ?, ?, ?, '待确认', ?, ?, ?, ?, '4. 合同生成', ?)
                    """,
                    (
                        contract_id,
                        order_id,
                        contract_type_for_method(demand["method"]),
                        demand["title"],
                        user["org"],
                        supplier,
                        f"{int(amount):,}元",
                        demand["description"],
                        f"根据项目需求和供应商报价生成，采购方式：{demand['method']}",
                    ),
                )
                conn.execute("UPDATE demands SET status = '已下单' WHERE id = ?", (data["demand_id"],))
            write_log(user["org"], "生成采购订单", demand["title"])
            self.json({"ok": True, "id": order_id}, 201)
            return
        if path == "/api/procurements":
            user = self.require_role("buyer", "admin")
            if not user:
                return
            with connect() as conn:
                item = conn.execute("SELECT * FROM items WHERE id = ?", (data.get("item_id"),)).fetchone()
                if not item:
                    self.json({"error": "采购资源不存在"}, 404)
                    return
                demand_id = f"D-{secrets.randbelow(90000) + 10000}"
                order_id = f"O-{secrets.randbelow(90000) + 10000}"
                contract_id = f"C-{secrets.randbelow(90000) + 10000}"
                procurement_type = data.get("procurement_type", "内部采购")
                amount_text = data.get("amount", item["price"])
                amount = amount_to_int(amount_text)
                title = f"{item['name']}采购项目"
                if "服务" in procurement_type:
                    title = f"{item['name']}服务项目"
                elif "租赁" in procurement_type:
                    title = f"{item['name']}租赁采购项目"
                content = item["specs"] or item["description"]
                conn.execute(
                    "INSERT INTO demands (id, title, region, category, budget, method, status, matched, description) VALUES (?, ?, ?, ?, ?, ?, '已下单', ?, ?)",
                    (demand_id, title, item["region"], item["category"], amount, procurement_type, item["name"], data.get("remark") or item["description"]),
                )
                conn.execute(
                    "INSERT INTO orders (id, title, supplier, amount, status) VALUES (?, ?, ?, ?, '合同待确认')",
                    (order_id, title, item["supplier"], amount),
                )
                conn.execute(
                    """
                    INSERT INTO contracts
                    (id, order_id, type, title, status, buyer_org, supplier, contact, address, delivery_time, amount_text, payment_terms, content, flow_node, remark)
                    VALUES (?, ?, ?, ?, '待确认', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        contract_id,
                        order_id,
                        contract_type_for(item, procurement_type),
                        title,
                        user["org"],
                        item["supplier"],
                        data.get("contact", ""),
                        data.get("address", ""),
                        data.get("delivery_time", ""),
                        amount_text,
                        data.get("payment_terms", ""),
                        content,
                        data.get("flow_node", "1. 需求申请"),
                        data.get("remark", ""),
                    ),
                )
            write_log(user["org"], "生成内部采购合同", title)
            self.json({"ok": True, "demand_id": demand_id, "order_id": order_id, "contract_id": contract_id}, 201)
            return
        self.send_error(404)

    def do_PATCH(self):
        parts = urlparse(self.path).path.strip("/").split("/")
        if len(parts) == 4 and parts[:2] == ["api", "items"] and parts[3] == "approve":
            user = self.require_role("admin")
            if not user:
                return
            with connect() as conn:
                row = conn.execute("SELECT name FROM items WHERE id = ?", (parts[2],)).fetchone()
                conn.execute("UPDATE items SET status = '上架' WHERE id = ?", (parts[2],))
            write_log(user["org"], "审核上架商品服务", row["name"] if row else parts[2])
            self.json({"ok": True})
            return
        if len(parts) == 4 and parts[:2] == ["api", "demands"] and parts[3] == "approve":
            user = self.require_role("admin")
            if not user:
                return
            with connect() as conn:
                row = conn.execute("SELECT * FROM demands WHERE id = ?", (parts[2],)).fetchone()
                matched = match_item(row["category"], row["region"]) if row else "待管理员确认采购路径"
                conn.execute("UPDATE demands SET status = ?, matched = ? WHERE id = ?", ("已匹配" if matched != "待管理员确认采购路径" else "待审核", matched, parts[2]))
            write_log(user["org"], "审核匹配采购需求", row["title"] if row else parts[2])
            self.json({"ok": True})
            return
        if len(parts) == 4 and parts[:2] == ["api", "orders"] and parts[3] == "next":
            user = self.require_role("buyer", "supplier", "admin")
            if not user:
                return
            flow = {"合同待确认": "履约中", "履约中": "待验收", "待验收": "已完成", "已完成": "已完成"}
            with connect() as conn:
                row = conn.execute("SELECT title, status FROM orders WHERE id = ?", (parts[2],)).fetchone()
                if row:
                    conn.execute("UPDATE orders SET status = ? WHERE id = ?", (flow.get(row["status"], "履约中"), parts[2]))
            write_log(user["org"], "推进订单履约状态", row["title"] if row else parts[2])
            self.json({"ok": True})
            return
        self.send_error(404)


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    host = os.environ.get("HOST", "127.0.0.1")
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"平台已启动：http://{host}:{port}/index.html")
    print("初始账号：buyer/123456 supplier/123456 admin/123456")
    print(f"数据库位置：{DB_PATH}")
    server.serve_forever()
