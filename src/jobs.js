var init = require('./init');
var async = require('async');

function get (command, options, done) {
  var quilt = init(options);
  var func;

  if (!command) {
    // return a partial that executes all saved jobs
    quilt.util.config.get.call(quilt, function (err, config) {
      if (err) return done(err);

      var tasks = [];
      config.forEach(function (job) {
        tasks.push(get.bind(null, job.command, job));
      });

      func = async.parallel.bind(async, tasks);
      // return the partial
      done(null, func);
    });
  } else if (options.save) {
    // format the job
    var job = {};
    job.remote = quilt.remote;
    job.mount = quilt.mount;
    job.command = command;
    job.watch = options.watch;
    // bind to add it
    func = quilt.util.config.add.bind(quilt, job);
    // return the partial
    done(null, func);
  } else if (command === 'jobs') {
    func = quilt.util.config.print.bind(quilt);
    done(null, func);
  } else {
    var group = quilt[command];

    // list, then optionally watch
    var tasks = [
      group.list.bind(quilt)
    ];

    if (options.watch) {
      tasks.push(group.watch.bind(quilt));
    }

    // return the partial
    func = async.series.bind(async, tasks);
    done(null, func);
  }
}

module.exports = {
  get: get
};