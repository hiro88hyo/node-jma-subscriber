var lambda = new (require('aws-sdk')).Lambda;
var xml2json = require('xml2json');
var PushBullet = require('pushbullet');
var moment = require('moment-timezone');

exports.handler = function(event, context) {
  console.log(JSON.stringify({event: event, context: context}, null, 2));
  var method = event['context']['http-method'];

  switch(method){
    case "GET":
      console.log(event);
      context.succeed({event: event, method: method});
      break;
    case "POST":
      var json = JSON.parse(xml2json.toJson(event['body']));
      console.log(JSON.stringify(json, null, 2));
      var entry = json['feed']['entry'];
      entry = Array.isArray(entry)?entry[0]:entry;
      var updated = new Date(Date.parse(json['feed']['updated']));
      var content = moment(updated).tz('Asia/Tokyo')
                    .format('YYYY/MM/DD HH:mm:ss') + 
                    '\n' +
                    entry['content']['$t'];

      lambda.getFunctionConfiguration({FunctionName:context.functionName},function(err,result){
        var pushbullet_access_token = JSON.parse(result.Description)['pushbullet_key'];
        var pusher = new PushBullet(pushbullet_access_token);
        pusher.note("", entry['title'], content, function(error, response){
          context.succeed({event: event, method: method});
        });
      });
      break;
    default:
      context.succeed({});
  }
};
