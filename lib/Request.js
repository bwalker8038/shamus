var prettyjson = require('prettyjson');
var net = require('net');

var Request = function (host, port) {
  var self = this;

  this.results = {
    connection: {}
  };

  this.host = host;
  this.port = port;

  this.client = net.createConnection(port, host, function () {

    // Send a HEAD response to see if the service is an http server
    self.client.write('HEAD / HTTP/1.1 \n' + "HOST: " + host + "\n\n");

    self.connectionHandler( self );
  });

  // Set the encoding
  this.client.setEncoding('utf8');

  // Handle data socket stream
  this.client.on('data', function ( data ) {
    self.dataSocketHandler( self, data );
  });

  // Handle on socket error
  this.client.on('error', function ( err ) {
    self.errorHandler( self, err );
  });

  // Handle on socket timeout
  this.client.on('timeout', function () {
    self.timeoutHandler( self );
  });


  // Handle on socket close
  this.client.on('close', function () {
    console.log( prettyjson.render(self.results) );
  });


  return this;
};

Request.prototype.errorHandler = function ( self, err ) {
  if ( err.code.indexOf('ECONNREFUSED') > -1 ) {
    self.results.connection.status = 'closed (connection was refused)';
  }

  if ( err.code.match(/EHOSTUNREACH/) ) {
    self.results.connection.status = 'closed (service was unreachable)';
  }
};

Request.prototype.timeoutHandler = function ( self ) {
  if ( !self.opened ) {
    self.result.connection.status = 'close (timed-out)';
  } else {
    self.results.connection.status = 'open';
  }

  self.client.destroy();
};


// Connection Request Handler
Request.prototype.connectionHandler = function ( self ) {
  var client = self.client;
  var results = self.results;
  self.opened = true;


  var ip = net.isIP(client.remoteAddress);
  var remoteFamily;

  if ( ip === 4 ) {
    remoteFamily = 'IPv4';
  } else if ( ip === 6  ) {
    remoteFamily = 'IPv6';
  }

  results.connection.hostname = self.host;
  results.connection.address = client.remoteAddress;
  results.connection.family = remoteFamily;
  results.connection.port = client.remotePort;
  results.connection.status = 'open';
};


// Data Socket Handler
Request.prototype.dataSocketHandler = function ( self, data ) {
  var client = self.client;
  var results = self.results;

  results.service = parseResponse(data);

  client.end();
};


function parseResponse ( data ) {
  var parsed = {
    software: []
  };

  var tmp = data.split('\r\n');

  if ( tmp[0].indexOf('SSH') > -1 ) {
    parsed.software.push(tmp[0]);

  } else if ( tmp[0].indexOf('HTTP/1.1') > -1 ) {
    for ( var i = 0; i < tmp.length; i++ ) {
      if ( tmp[i].indexOf(': ') ) {
        var line = tmp[i].split(': ');

        if ( line[0] === 'Server' || line[0] === 'X-Powered-By' ) {
            parsed.software.push(line[1])
        }
      }
    }
  } else {
    parsed.software.push(tmp[0]);
  }

  return parsed;
}


// Export the module
module.exports = Request;
