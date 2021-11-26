let http = require('http');
let PORT = process.env.PORT ?? 8080
let URL = require('url');

const { statSync, createReadStream } = require('fs')




function internalError(res) {
	res.writeHead(500,{'Content-Type':'text/plain'});
	res.end('internal server error')
}


async function download (req, res, ip, url) {
    var path = '.'+url.pathname.toString()
    console.info(path)
    if (path == undefined || path == null) {
        res.writeHead(500,{'Content-Type':'text/plain'});
        res.end('internal server error')
        return
    }
    try {

        var stat = statSync(path)
        if (stat == undefined) throw 'invalid file'
        res.writeHeader(200, {"Content-Length": stat.size});
        var stream = createReadStream(path)
        stream.on('error', function (e) {internalError(res)})
        stream.on('data', function (chunk) {if(!res.write(chunk)) stream.pause()});
        stream.on('end', function () {res.end()});
        res.on("drain", function () {stream.resume()});
    }
    catch (e) {
        //console.info(e)
        internalError(res)
    }
}	



http.createServer((req, res)=>{
    let url = URL.parse(req.url,true);
//	if (url.pathname === "/") {
		download(req, res, '', url)
		return;
//	}
}).listen(PORT)


