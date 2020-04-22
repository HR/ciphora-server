const gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  env = require('gulp-env'),
  exec = require('child_process').exec

gulp.task('nodemon', function (done) {
  env({
    file: '.env',
    vars: {
      NODE_ENV: 'development'
    }
  })

  nodemon({
    script: 'server.js',
    verbose: true,
    debug: true,
    ignore: ['logs/', '*.log', '.DS_Store'],
    nodeArgs: ['--inspect'],
    ext: 'js json',
    events: {
      restart:
        'osascript -e \'display notification "App restarted due to:\n\'$FILENAME\'" with title "nodemon"\''
    },
    done: done
  })
})

gulp.task('inspect', function () {
  env({
    file: '.env',
    vars: {}
  })

  exec('./node_modules/.bin/nodemon --inspect-brk server.js', function (
    err,
    stdout,
    stderr
  ) {
    console.log(stdout)
    console.log(stderr)
  })
})

gulp.task('default', gulp.parallel('nodemon'))
