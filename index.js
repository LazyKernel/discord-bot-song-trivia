var forever = require('forever');
var child = new (forever.Monitor )('bot.js', {
  //options : options
} );

//logging events
child.on( "exit", function() {
  console.log( 'bot.js has exited!' );
} );
child.on( "restart", function() {
  console.log( 'bot.js has restarted.' );
} );
child.on( 'watch:restart', function( info ) {
  console.error( 'Restarting script because ' + info.file + ' changed' );
} );

//Starts the process
child.start();
forever.startServer( child );

process.on( 'exit', function() {
  console.log( 'About to exit \'node forever\' process.' );
} );

process.on( 'uncaughtException', function( err ) {
  console.log( 'Caught exception in \'node forever\': ' + err );
} );