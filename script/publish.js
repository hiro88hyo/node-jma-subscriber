var aws = require('aws-sdk'),
    fs  = require('fs'),
    lambdaConfig = require('../lambdaConfig'),
    pkgConfig = require('../package');

var lambda  = new aws.Lambda({region: lambdaConfig.region}),
    zipPath = 'pkg/' + pkgConfig.name + '.zip';

var params = {
  ZipFile: fs.readFileSync(zipPath),
  FunctionName: pkgConfig.name,
  Publish: true
};

lambda.updateFunctionCode(params, function(err, data) {
  if (err) console.log(err, err.stack);
  else     console.log(data);
});

function buildHnadlerName(lambdaConfig){
  return lambdaConfig.handlerFile + '.' + lambdaConfig.handlerMethod;
}
