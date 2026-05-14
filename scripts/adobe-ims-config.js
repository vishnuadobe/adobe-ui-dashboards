const DEV_PREVIEW_ORIGIN = 'https://dev--adobe-ui-dashboards--vishnuadobe.aem.page';
const currentOrigin = window.location.hostname.includes('localhost')
  ? DEV_PREVIEW_ORIGIN
  : window.location.origin;

const adobeImsConfig = {
  clientId: 'uidashboard',
  redirectUri: currentOrigin,
  postLogoutRedirectUri: currentOrigin,
  scopes: [
    'AdobeID',
    'additional_info.company',
    'additional_info.ownerOrg',
    'avatar',
    'openid',
    'read_organizations',
    'read_pc',
    'session',
    'account_cluster.read',
  ],
  environment: window.location.hostname.includes('.live') ? 'prod' : 'stg1',
  imsScript: 'https://auth.services.adobe.com/imslib/imslib.min.js',
  authorizationEndpoint: 'https://ims-na1.adobelogin.com/ims/authorize/v2',
  tokenEndpoint: 'https://ims-na1.adobelogin.com/ims/token/v3',
  userInfoEndpoint: 'https://ims-na1.adobelogin.com/ims/userinfo/v2',
  revocationEndpoint: 'https://ims-na1.adobelogin.com/ims/revoke',
  protectedPaths: ['/'],
};

export default adobeImsConfig;
