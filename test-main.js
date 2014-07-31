var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  var newPath =  path.replace(/^\/base\//, '../../').replace(/\.js$/, '');
  return newPath;
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    console.log(file);
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/src/js/',

  paths: {
    'bower': '../../bower_components/',
    'scribe': '../../bower_components/scribe/scribe',
    'jquery': '../../bower_components/jquery/dist/jquery',
  },

  shim: {
    'jquery': {
      exports: '$'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
