# koa + typescript web server framework

koa + typescript web framework [中文文档](/README_CN.md)

### About Environments
* typescript >= 4.7.4
* node>= 17.1.0

### how to run

* git clone this repository
* npm install
* npm run dev
* open browser and visit http://localhost:3000

### how to use
* add controller in ./src/controllers
* add controller's exports in ./srcc/controllers/index.ts
### add controller method rules
* the controller should implement IController
* the controller's method name should start with get/put/post/delete，this framework will auto inject get/put/post/delete methods，and the route path will use **controller.path + method.Name**(trim get/put/post/delete), if the method has no @Route decorator, else will use @Route’s value directly
