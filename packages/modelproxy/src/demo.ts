const modelproxy = require("./");
const proxy = new modelproxy.ModelProxy();

proxy.loadConfig({
    "key": "test",
    "title": "p-uc",
    "engine": "default",
    "mockDir": "/mocks/",
    "states": {
        "prod": "http://www.baidu.com",
        "test": "http://www.baidu.com",
        "dev": "http://www.baidu.com",
        "stag": "http://www.baidu.com"
    },
    "state": "dev",
    "interfaces": [{
        "key": "articles",
        "title": "文章接口",
        "method": "GET",
        "path": "/articles"
    }, {
        "key": "users",
        "title": "用户列表",
        "method": "GET",
        "path": "/users",
        "engine": "default"
    }]
}, {});

let users = proxy.getNs("test").get("users");
let articles = proxy.getNs("test").get("articles");

if (users && articles) {
    // articles.rest(users.getPath(1));
    articles.get(null, {
        instance: {
            path: users.replacePath(users) + articles.path
        }
    }); // 处理下，变成  "http://www.baidu.com/users/1/articles"
}
