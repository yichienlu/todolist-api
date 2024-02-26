const http = require('http')
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle')
const todos = []

const requestListener = function (req, res){
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  let body = ""
  req.on('data', chunk=>{   //  node.js 底層原生寫法
    body+=chunk
  })

  // GET
  if(req.url==="/todos" && req.method == "GET"){
    res.writeHead(200,headers);
    res.write(JSON.stringify({
      "status": "success",
      "data":todos
    }));
    res.end();
  } 
  // POST
  else if(req.url==="/todos" && req.method == "POST"){
    req.on('end',()=>{
      try {
        const title = JSON.parse(body).title
        if(title==undefined){
          errorHandle(res)
        } else {
          const todo = {
            "title": title,
            "id": uuidv4()
          }
          todos.push(todo)
          res.writeHead(200,headers);
          res.write(JSON.stringify({
            "status": "success",
            "data":todos
          }));
          res.end();
        }

      } catch (error) {
        errorHandle(res)
      }

    })
  } 
  // DELETE all
  else if(req.url==="/todos" && req.method == "DELETE"){
    todos.length = 0
    res.writeHead(200,headers);
    res.write(JSON.stringify({
      "status": "success",
      "data":todos
    }));
    res.end();
  } 
  // DELETE id
  else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
    const id = req.url.split('/').pop()
    const index = todos.findIndex(item=>item.id===id)
    if(index==-1){
      errorHandle(res)
    } else {
      todos.splice(index,1)
      res.writeHead(200,headers);
      res.write(JSON.stringify({
        "status": "DELETE id success",
        "data":todos
      }));
      res.end();
    }


  }
  // PATCH id
  else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
    req.on('end',()=>{
      try{
        const id = req.url.split('/').pop()
        const index = todos.findIndex(item=>item.id===id)
        const title = JSON.parse(body).title
        if(index!==-1 && title==!undefined){
          todos[index].title = title
          res.writeHead(200,headers);
          res.write(JSON.stringify({
            "status": "PATCH id success",
            "data":todos,
          }));
          res.end();
        } else {
          errorHandle(res)
        }
      } catch {
        errorHandle(res)
      }
    })
  }
  // OPTIONS
  else if (req.method == "OPTIONS"){ // 跨網域請求
    res.writeHead(200,headers);
    res.end();
  }
  // ERROR
  else {
    res.writeHead(404,headers);
    res.write(JSON.stringify({
      "status": "false",
      "message":"無此網站路由"
    }));
    res.end();
  }

}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 3005)