var http = require('http');
const port = 3000;

http.createServer(onRequest).listen(port);
console.log("Content-Nextcloud-Proxy started on Port: "+port)

async function onRequest(client_req, client_res) {
 
  var options = {
    hostname: '127.0.0.1',
    port: 80,
    path: '/nextcloud/remote.php/webdav'+client_req.url,
    method: client_req.method,
    headers: {...client_req.headers,"Authorization":"Basic YWRtaW46YWRtaW4="}
  };

  if (checkPermission()){
    var proxy = http.request(options, function (res) {
      const header = res.headers;
      try { 
        header["content-disposition"] = header["content-disposition"].replace("attachment", "inline");
        header["content-security-policy"] = header["content-security-policy"].replace("'none'", "*");
        client_res.writeHead(res.statusCode, header)
        res.pipe(client_res, {
          end: true
        }); 
      }
      catch(err) {
        showErrorPage(client_res, 404, 'Nothing to see here - page not found')
      }
    });
    client_req.pipe(proxy, {
      end: true
    }); 
  }
  else{
    showErrorPage(client_res, 401, 'Access denied - You have no permission to see this!')
  }
} 

function showErrorPage(client_res, statusCode, message){
  client_res.statusCode = statusCode;
    client_res.write('\
      <body style="background: #ddd">\
        <div style="font-family: verdana; text-align:center">\
          <p style="font-size: 10em; margin: .3em" >&#3232;_&#3232;</p>\
          <h2>'+message+'</h2>\
        </div>\
      </body>\
    ');
    client_res.end();
}

function checkPermission(){
  return (Math.random() < 0.5)? true : false; 
}