module.exports = {
  getBaseDomain: domain => {
    logger.debug(`Getting base domain for ${domain}`);

    const [ protocol, rest ] = domain.split('//');
    const [ baseDomain, path ] = rest.split('/');

    logger.debug({
      protocol,
      rest,
      baseDomain,
      path
    });

    return baseDomain;
  },
  isValidLinkType: link => {
    const BAD_LINK_TYPES = [
      'callto', 'wtai', 'tel', 'sms', 'market', 'geopoint', 'ymsgr', 'msnim',
      'gtalk', 'skype', 'sip', 'whatsapp', 'mailto', 'javascript'
    ];

    for(let i = 0; i < BAD_LINK_TYPES.length; i++) {
      if (link.startsWith(`${BAD_LINK_TYPES[ i ]}:`)) {
        logger.debug(`Found a bad link: ${link}`);
        return false;
      }
    }

    return true;
  },
  removeQueryParams: link => {
    const [ baseUrl ] = link.split('?');

    return baseUrl;
  },
  removeAnchorTags: link => {
    const [ baseUrl ] = link.split('#');

    return baseUrl;
  }
}
