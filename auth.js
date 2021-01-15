const { pool, router, ConstructReturnData } = require('./connect');
const jwt = require('jsonwebtoken');

/**
 * 登录
 */
router.post('/login', (req, res) => {
  const { userName, userPwd } = req.body;
  pool.getConnection((err, conn) => {
    conn.query(
      `SELECT * FROM userVO WHERE userName='${userName}'`,
      (e, result) => {
        const backData = {};
        const { length } = result;
        /**
         * 先用户是否存在的校验
         * 如果用户存在则做密码校验
         * 这里设置code，在构造返回结果的方法中通过code统一处理返回的错误描述
         */
        if (length === 0) {
          backData.code = 1001
        } else {
          const isPwdRight = result[0].userPwd === userPwd;
          backData.code = isPwdRight ? 0 : 1002;
          if (isPwdRight) {
            backData.data = result[0];
            const token = jwt.sign(
              {name: userName},
              'my-home',
              {
                expiresIn: 1*24*60*60
              }
            );
            const { host } = req.headers;
            res.cookie('my_home_token', token, {
              domain: host,
              path: '/',
              maxAge: 1*24*60*60,
            });
          }
        };
        res.json(new ConstructReturnData(backData))
      }
    );
    conn.release();
  })
});
/**
 * 获取当前用户信息
 */
router.get('/user', (req, res) => {
  const { userName } = req.body;
  pool.getConnection((err, conn) => {
    conn.query(
      `SELECT * FROM userVO WHERE userName='${userName}'`,
      (e, result) => {
        const { length } = result;
        const backData = {};
        if (length === 0) {
          backData.code = 1004;
        } else {
          backData.data = result;
        }
        res.json(new ConstructReturnData(backData))
      }
    );
    conn.release();
  })
});
/**
 * 新增用户
 */
router.post('/register', (req, res) => {
  const {name, account, phoneNumber, sex, age, address} = req.body;
  pool.getConnection((err, conn) => {
    conn.query(
      `INSERT INTO userVO SET ?`,
      {name, account, phoneNumber, sex, age, address},
      (e, r) => {
        if (r) res.json(new ConstructReturnData({msg: '注册成功，开始记录你的一切吧！'}))
      }
    );
    conn.release();
  })
});

module.exports = router