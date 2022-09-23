# koa + typescript web服务框架

### 框架执行环境
* typescript >= 4.7.4
* node>= 17.1.0

### 如何运行

* git clone 
* npm install
* npm run dev
* 浏览器打开地址 http://localhost:3000 浏览

### 框架如何使用
* 直接在controllers目录中添加相应的业务接口
* 在controllers目录下的index.ts中添加controller的导出
### controller业务方法规则
* controller需要实现接口IController
* action必须以get/put/post/delete开头，框架会自动检测注入对应get/put/post/delete方法，路由由controller.path + action.Name(不包含/get/put/post/delete), 例如action为getName的方法，最终注册路由为`{controller.path}name`
