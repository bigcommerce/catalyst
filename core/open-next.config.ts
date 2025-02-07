const config = {
  default: {
    // This is the default server, similar to the server-function in open-next v2
    // You don't have to provide the below, by default it will generate an output
    // for normal lambda as in open-next v2
    override: {
      wrapper: 'aws-lambda-streaming', // This is necessary to enable lambda streaming
    },
    minify: true, // This will minify the output
  },
  functions: {
    auth: {
      runtime: 'edge',
      // placement: "global", If you want your function to be deployed globally (i.e. lambda@edge) uncomment this line. Otherwise it will be deployed in the region specified in the stack
      routes: ['app/api/auth/[...nextauth]/route'],
      patterns: ['/api/*'],
    },
    admin: {
      runtime: 'edge',
      routes: ['app/admin/route'],
      patterns: ['/admin/*'],
    },
    login: {
      runtime: 'edge',
      routes: ['app/login/token/route'],
      patterns: ['/login/token/*'],
    },
    faviconico: {
      routes: ['app/favicon.ico/route'],
      patterns: ['favicon.ico/*'],
    },
  },
  middleware: {
    external: true,
  },
  dangerous: {
    enableCacheInterception: true,
  },
  imageOptimization: {
    // This is the architecture of the image, it could be x64 or arm64
    // This is necessary to bundle the proper version of sharp
    arch: 'arm64',
  },
  // buildCommand: 'npx turbo build',
};

module.exports = config;
