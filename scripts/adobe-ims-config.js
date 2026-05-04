const adobeImsConfig = {
  clientId: 'uidashboard',
  redirectUri: `${window.location.origin}/login/callback`,
  postLogoutRedirectUri: window.location.origin,
  scopes: ['AdobeID', 'openid', 'profile', 'email'],
  authorizationEndpoint: 'https://ims-na1.adobelogin.com/ims/authorize/v2',
  tokenEndpoint: 'https://ims-na1.adobelogin.com/ims/token/v3',
  userInfoEndpoint: 'https://ims-na1.adobelogin.com/ims/userinfo/v2',
  revocationEndpoint: 'https://ims-na1.adobelogin.com/ims/revoke',
  protectedPaths: ['/app-launcher'],
};

export default adobeImsConfig;
