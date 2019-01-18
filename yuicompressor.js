var compressor = require('yuicompressor'),
    path = require('path'),
    fs = require('fs'),
    exists = fs.existsSync || path.existsSync;

function buildFiles(dir,callback){
    var files = [];
    var readDirs = fs.readdirSync(dir);
    console.info("--------------------------");
    readDirs.forEach(function (fileName) {

        var dirPath = dir + '/' + fileName;
        if (fs.statSync(dirPath).isDirectory()) {
            // 如果是文件夹遍历
            buildFiles(dirPath);
        } else {
            var ext = path.extname(fileName),
                name = fileName.substring(0,fileName.indexOf('.'));
            if (ext === '.js' || ext === '.css') {

                var comp = path.join(dir, name + '.min'+ext);
                console.info(comp);
                if (!exists(comp)) {
                    files.push({
                        type: ext.replace('.', ''),
                        test: fileName,
                        result:path.join(dir,fileName),
                        path: comp
                    });
                }
            }
        }
    });
    if(callback)callback(files);
}

var base = path.join(__dirname, '/views');
buildFiles(base,function (filesObj) {
    filesObj.forEach(function(item) {
        console.info(item);
        compressor.compress(item.result, {
            type: item.type,
            charset: 'utf8'
        }, function(err, data) {
            fs.writeFile(item.path, data, function(){
                console.log('yuicompressor success!');
            });
        });

    });
});



