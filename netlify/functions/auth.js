exports.handler = async (event, context) => {
  const { httpMethod, headers } = event;
  
  if (httpMethod === 'GET') {
    const auth = headers.authorization;
    
    if (!auth || !auth.startsWith('Basic ')) {
      return {
        statusCode: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Protected Area"',
        },
        body: 'Authentication required'
      };
    }
    
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [username, password] = credentials.split(':');
    
    if (username === 'skdental' && password === 'P25sakD26') {
      return {
        statusCode: 200,
        body: 'Access granted'
      };
    } else {
      return {
        statusCode: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Protected Area"',
        },
        body: 'Invalid credentials'
      };
    }
  }
  
  return {
    statusCode: 405,
    body: 'Method not allowed'
  };
};
