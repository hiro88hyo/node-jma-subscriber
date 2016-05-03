// We will put dummy objects for event and context;
var event = {};
var context = {
  // InvokeID may be unique invocation id for AWS Lambda.
  invokeid: 'string',
  // context.done() should be called for end of each invocation.
  // We would want to stub this.
  done: function(err,data){
    return;
  }
};

// Then we can load and run your function.
var lambdaFunction = require('./index');
lambdaFunction.handler(event,context);

