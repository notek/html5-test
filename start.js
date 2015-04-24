var fs = require('fs'),
	path = require('path'),
	http = require('http'),
	url = require('url'),
	querystring = require('querystring');

var mime = {
	".css": "text/css",
    ".gif": "image/gif",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tiff": "image/tiff",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".xml": "text/xml",
};

http.createServer(function(request, response) {

	var pathname = url.parse(request.url).pathname,
		dir = __dirname + pathname, postData = [], size = 0;

	//处理post请求
	if(pathname === '/html5-basic-6.html' && request.method === 'POST') {
		
		//request.setEncoding('utf8');
		request.addListener('data', function(chunk) {

			postData.push(chunk);
			size += chunk.length;

		}).addListener('end', function() {

			var pos1, pos2, posCollection = [],
				fileResult = null, fileName = '',
				mime = '', fileInfo = '', fileContent = '',
				buffer = Buffer.concat(postData, size);

    		//获取\r和\n的ascii码的位置
		    for(var i=0;i<buffer.length;i++){
		        var pos1 = buffer[i];
		        var pos2 = buffer[i+1];
		        if(pos1 == 13 && pos2 == 10){
		            posCollection.push(i);
		        }
		    }

    		//图片数据
		    fileContent = buffer.slice(posCollection[3] + 2, posCollection[posCollection.length - 2]);
			fileResult = buffer.toString('utf-8').split('\r\n');
			fileResult = fileResult.filter(function(item) {
				return item !== '';
			});
			
			fileInfo = fileResult[1]; //文件信息
			mime = fileResult[2];	  //文件mime类型
			
			//文件名
			fileInfo.replace(/filename="(.*)"$/g, function() {
				fileName = arguments[1];
			});
			
			if(!fs.existsSync('./upload')) {
				fs.mkdirSync('./upload');
			}
			fs.writeFileSync('upload/' + fileName, fileContent);
			response.write('{"uploadedCode": "1","uploadedUrl": "upload/'+ fileName +'","mime":"'+ mime +'"}');
			response.end();

		});

		return;

	}


	//default display directory.
	if(pathname === '/') {
		fs.readdir(dir, function(err, files) {
			if(err) throw new Error('error reading!');

			var dirArr = [];
			files.forEach(function(item) {

				//隐藏重要文件或者不必要的文件
				if(item !== '.git' && item !== 'start.js') {
					dirArr.push(item);
				}

			});
			response.write(dirArr.join('\n\n'));
			response.end();

		});
		return;
	}

	//需要排除的路径
	switch(pathname) {

		case '/start.js':
		case '/favicon.ico':
			response.end('Permsission denied！');
			return;
			break;

	}

	fs.exists(dir, function(exists) {
		if(exists) {

			//使用二进制读取文件，避免访问图片等资源直接下载
			fs.readFile(dir, 'binary', function(err, data) {

				if(err) {
					response.writeHead(500, {'Content-Type': 'text/plain'});
					response.end(err);
				}
				
				var suffix = path.extname(pathname);
				//mime类型，默认为纯文本
				var mimeType = mime[suffix] || 'text/plain';
				//设置过期时间头
				if(/css|js|html|jpg|png/ig.test(suffix)) {
					response.setHeader('Expires', new Date(new Date().getTime() + 60 * 60 * 24 * 30 * 1000));
					response.setHeader('Cache-Control', 'max-age=' + 60 * 60 * 24 * 30);
				}

				//检查最后修改时间请求
				var stats = fs.statSync(dir);
				if(err) throw err;
			    var lastModified = stats.mtime.toUTCString();
			    response.setHeader("Last-Modified", lastModified);
				if(request.headers['if-modified-since'] && lastModified == request.headers['if-modified-since']) {

				    response.writeHead(304, "Not Modified");
				    response.end();

				}else {

					response.writeHead(200, {'Content-Type': mimeType});
					response.write(data, 'binary');
					response.end();
					
				}

			});
		}else {
			response.end('"' + pathname + '":404 not found.');
		}

	});

}).listen(8000);
console.log('srever starting success! port on 8000...');
