var express			= require('express'),
	app				= express(),
	log 			= require('debug')('main:log'),
	error 			= require('debug')('main:error'),
//	bodyParser 		= require('body-parser'),
	cookieParser 	= require('cookie-parser'),
	pg				= require('pg'),
	sockjs  		= require('sockjs'),
	_				= require('lodash'),
    formidable      = require('formidable'),
    util            = require('util'),
    fs              = require('fs.extra'),
    url             = require('url'),
    path            = require('path'),
    compression     = require('compression'),
    lessMiddleware  = require('less-middleware');
	
global.require_watch	= require('./lib/require_watch.js');

global.config		= require_watch(__dirname+'/config.js', function(mod) {global.config = mod;});

global.DBO = require_watch(__dirname+'/lib/db.js', function(mod) {global.DBO = mod;});
global.DB			= new DBO();

//global.Experiment	= require_watch(__dirname+'/lib/experimentBase.js', function(mod) {global.Experiment = mod;});

global.Probe = require_watch(__dirname+'/lib/probe.js', function(mod) {global.Probe = mod;});

global.Mail = require(__dirname+'/lib/mail.js')

// new mail(srv, {
//     smtp_user: self.config.mail.mailgun_smtp_user,
//     smtp_pass: self.config.mail.mailgun_smtp_pass,
//     mail_sender: self.config.mail.sender
// });

var Messaging		= require_watch(__dirname+'/lib/messaging/index.js', function(mod) {Messaging = mod;});

// FOR DEBUG
Object.defineProperty(global, '__STACK__',{
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__FILE__',{
    get: function(){
        return __STACK__[1].getFileName().split('/').slice(-1)[0];
    }
});

Object.defineProperty(global, '__LINE__',{
    get: function(){
        return __STACK__[1].getLineNumber();
    }
});

process.on('SIGINT', function(){
	log('Exit by CTRL+C, pid='+process.pid);
	process.exit(0);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', error(err.stack));
});

global.addHeaders = function(res) 
{
	res.connection.setTimeout(0);
	res.header('Content-Type', 'application/json; charset=utf-8');
	res.header('Cache-Control', 'no-store, no-cache, must-revalidate');
	res.header('Pragma', 'no-cache');
	res.header('Access-Control-Allow-Origin', '*');
};

function start()
{
	log('Starting...');
	/* setup web server */
	var app = express();
//	app.use(bodyParser.json());
//	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());    
    // compress static files to gzip
	app.use(compression());
    
    /* watch and compile LESS files to CSS at server */
    if (fs.existsSync('./public/all.js'))
    {
        log("LESS: result CSS will be minified!");
        // we have minified version
        app.use(lessMiddleware(__dirname + '/public', {
            debug: false,
            render: {
                compress: true
                //env: "development",
                //dumpLineNumbers: "comments"
            }
        }));  
    }
    else
        app.use(lessMiddleware(__dirname + '/public', {
            debug: true,
            render: {
                compress: false,
                env: "development",
                sourceMap: {
                    outputSourceFiles: true
                }
            },
            postprocess: {
                css: function(css, req)
                {
                    return css + "\n\n/*# sourceMappingURL=style.css.map */";
                }
            }
        }));
    
	/* host static files */
    app.use('/', express.static('./public'));
		
    /* board file uploads */
    app.use(function(req, res, next)
    {
        var form;
        if (req.method.toLowerCase() === 'post') 
        {
            form = new formidable.IncomingForm();
            form.hash = 'md5';
            form.multiples = true;
            form.parse(req, function(err, fields, files){
                if (err) 
                {
                    error('formidable:parse ' + err);
                    return res.status(500).send('upload error');
                }
                else 
                {
                    req.fields = fields;
                    req.files = files;
                    return console.log('parsed');
                }
            });
            form.on('end', function(){
                return next();
            });
        } 
        else 
        {
          return next();
        }
    });

    app.post('/upload/board/', function(req, res, next) {
        var reqURL = url.parse(req.url, true),
            file = req.files.boardimage;
        
       /* if (! (reqURL &&
               reqURL.query 
               && (~~reqURL.query.boardId > 0) 
               && req.files.boardimage) )
        {
            res.send(JSON.stringify({success: 0, error: 'INVALID_REQUEST'}));
            return;
        }*/
        var boardId = '',//(~~reqURL.query.boardId, // integer boardId
            newFilename = Math.ceil(Math.random()*10000000+99999)+path.extname(file.name),
            pathToSave = './public/static/boards/custom/'+newFilename;
        
        // move file to dir
        //fs.move(req.files.boardimage.path, pathToSave, function(err) {
        fs.move(file.path, pathToSave, function(err) {

                console.log(err);
            if (err)
            {
                res.send(JSON.stringify({success: 0, error: 'CANT_MOVE_FILE'}));
                return;
            }
            
            res.send(JSON.stringify({success: 1, filename: newFilename, originalTitle: file.name}));
            return;
        });
    });

    app.post('/upload/board/base64/', function(req, res, next) {
        var reqURL = url.parse(req.url, true),
            data = req.fields.data,
            filename = req.fields.filename,
            boardId = req.fields.boardId;
        
        log("+OK - post /upload/board/base64/. boardId: ", boardId);

        if (!boardId) {
            res.send(JSON.stringify({success: 0, error: 'CANT_MOVE_FILE'}));
            return;
        }

        var newFilename = boardId + '_default' + path.extname(filename),
            pathToSave = './public/static/boards/custom/' + newFilename;

        fnWriteFile(pathToSave, data);

        function fnWriteFile(pathToSave, data) {
            // Write incoming base64 data to the file
            fs.writeFile(pathToSave, data, 'base64', function(err) {

                console.log(err);
                if (err)
                {
                    res.send(JSON.stringify({success: 0, error: 'CANT_MOVE_FILE'}));
                    return;
                }
                
                res.send(JSON.stringify({success: 1, filename: newFilename, originalTitle: filename}));
                return;
            });
        }
    });
    
	var sockjs_opts = {sockjs_url: "/public/js/offsource/sockjs.min.js", prefix: '/ws'},
		sockjsServer = sockjs.createServer(sockjs_opts),
		server = require('http').createServer(app);
	
	sockjsServer.installHandlers(server);
    
	// start messaging server
	global.messaging = new (Messaging)(sockjsServer);

	DB.initInternalDb(function(err){
		server.listen(config.HTTP_PORT, '0.0.0.0');
	});
	    
    //server.listen(config.HTTP_PORT, '0.0.0.0');
	log('HTTP server running at port='+config.HTTP_PORT+', PID='+process.pid);	
}

start();

