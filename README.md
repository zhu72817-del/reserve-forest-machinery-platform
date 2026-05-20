# 林业机械综合服务平台

这是一个可部署的网站系统版本，前台包含首页、内采商城、机械设备库、机械服务库、项目需求大厅和供应商库；后台包含采购人、供应商和管理员三类登录入口及基础业务流程。

当前内采商城严格展示《森林防火产品完整宣传册》中的产品：

- 森林防火装备：9 款
- 车辆装备：7 款

## 本地运行

```bash
cd "项目目录"
PORT=8096 python3 server.py
```

打开：

```text
http://127.0.0.1:8096
```

## 演示账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 需求方 / 储备林公司 | buyer | 123456 |
| 供应商 | supplier | 123456 |
| 物资公司管理员 | admin | 123456 |
| 平台管理员 | manager | 123456 |
| 超级管理员 | superadmin | 123456 |

## 主要文件

| 文件 | 说明 |
| --- | --- |
| `server.py` | 后端服务、API、SQLite 初始化和静态文件服务 |
| `index.html` | 前台门户和登录后工作台页面 |
| `app.js` | 前端交互、模块切换、数据渲染 |
| `styles.css` | 页面样式 |
| `assets/` | Logo、首页图、产品图片 |
| `data/platform.db` | SQLite 数据库，首次启动会自动初始化 |
| `render.yaml` | Render 云平台部署配置 |
| `Dockerfile` | Docker 部署配置 |

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | 本地运行默认仅本机访问；服务器部署请设为 `0.0.0.0` |
| `PORT` | `8080` | 服务端口 |
| `PLATFORM_DB_PATH` | `data/platform.db` | SQLite 数据库路径 |

## 云服务器部署

服务器需要安装 Python 3.11 或更高版本。

```bash
unzip reserve-forest-machinery-platform-deploy.zip
cd reserve-forest-machinery-platform
HOST=0.0.0.0 PORT=8080 python3 server.py
```

然后浏览器访问：

```text
http://服务器公网IP:8080
```

如果服务器使用安全组或防火墙，需要放行对应端口。

## Render 部署

1. 把项目上传到 GitHub。
2. 登录 Render，新建 Web Service。
3. 选择该 GitHub 仓库。
4. Render 会读取 `render.yaml`。
5. 部署完成后，Render 会生成一个公网地址，可以直接发给领导访问。

## Docker 部署

```bash
docker build -t reserve-forest-machinery-platform .
docker run -d --name forest-platform -p 8080:8080 reserve-forest-machinery-platform
```

访问：

```text
http://服务器公网IP:8080
```

## 健康检查

```text
/api/health
```

返回：

```json
{"ok": true, "service": "forest-machinery-platform"}
```
