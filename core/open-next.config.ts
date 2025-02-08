const config = {
  default: {},
  functions: {
    auth: {
      // runtime: 'edge',
      routes: ['app/api/auth/[...nextauth]/route'],
      patterns: ['/api/*'],
    },
    admin: {
      // runtime: 'edge',
      routes: ['app/admin/route'],
      patterns: ['/admin/*'],
    },
    loginToken: {
      // runtime: 'edge',
      routes: ['app/login/token/[token]/route'],
      patterns: ['/login/token/*'],
    },
    sitemap: {
      // runtime: 'edge',
      routes: ['app/sitemap.xml/route'],
      patterns: ['/*'],
    },
    xmlsitemap: {
      // runtime: 'edge',
      routes: ['app/xmlsitemap.php/route'],
      patterns: ['/*'],
    },
  },
};

module.exports = config;
