const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser'); // 参数解析插件
const cors = require('cors'); // 处理跨域
const app = express();
const router = express.Router();
const stateCode = require('./stateCode.json');
const cookieParser = require('cookie-parser')
const constructReturnData = require('./middlewares/index');

const connectMySqlOption = {
  host: 'localhost',
  user: 'root',
  password: '03251322',
  database: 'mysql',
  connectTimeout: 5000, // 链接超时
  multipleStatements: false // 是否允许一个query中包含多条sql语句
}

app.use(bodyParser.json()); // json请求
app.use(cors())
app.use(cookieParser());  
app.use(bodyParser.urlencoded({extended: false})); // 表单请求
// app.use(constructReturnData)

let pool;
repool()

/**
 * 构造函数封装返回的结果
 */
function ConstructReturnData({code = 0, data = {}} = {}) {
  this.code = code;
  this.msg = stateCode[code];
  this.data = data;
}

/**
 * mysql断线重连
 */
function repool() {
  /**
   * 建立连接/短线重连
   */
  pool = mysql.createPool({
    ...connectMySqlOption,
    waitForConnections: true, // 当无链接池可用时， 等待（true）还是抛错（false）
    connectTimeout: 100, // 连接数量限制
    queueLimit: 0 // 最大连接等待数（0为不限制）
  })
  // 监听短线并重连
  pool.on('error', err => {
    console.log('pool.on:::error');
    if (err.code ==='PROTOCOL_CONNECTION_LOST') repool();
  });
};

module.exports = {pool, ConstructReturnData, router, app}