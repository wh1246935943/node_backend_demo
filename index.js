const { app, ConstructReturnData } = require('./connect');
const auth = require('./auth');
const jwt = require('jsonwebtoken');

app.all('*', (req, res, next) => {
  const { cookies: { my_home_token }, url } = req;
  /**
   * token 校验
   * 校验非登录接口的请求
   */
  const outsideApib = ['/auth/register', '/auth/login']
  if (!outsideApib.includes(url)) {
    // jwt.verify(my_home_token, 'my-home', (err, data) => {
    //   if (err) {
    //     res.json(new ConstructReturnData({code: 1003}));
    //     return
    //   }
    // })
    let isInvalidToken = true;
    try {
      jwt.verify(my_home_token, 'my-home');
      isInvalidToken = false
    } catch (error) {}
    if (isInvalidToken) {
      res.json(new ConstructReturnData({code: 1003}));
      return
    }
  }
  next()
});

app.use('/auth', auth);

app.listen(80, () => console.log('服务启动了'));