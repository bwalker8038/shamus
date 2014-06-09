#!/usr/bin/env node

var program = require('commander');

var request = require('../lib/request');

// Parse port input
function ports (val) {
  var tmp;

  if ( val.indexOf(',') ) {
    tmp = val.split(',');
  } else {
    tmp = val;
  }

  return tmp;
}



program
  .usage('<hostname> [options]')
  .version('0.1.0')
  .option('-p, --port <ports>', "specified ports, e.g. 80,443", ports)
  .parse(process.argv);

var host = process.argv[2];

if ( program.port ) {
  for ( var i = 0; i < program.port.length; i++ ) {
    var req = new request( host, program.port[i] );
  }
}
