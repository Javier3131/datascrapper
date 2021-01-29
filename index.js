const { LinkedInProfileScraper } = require('linkedin-profile-scraper');
const puppeteer = require('puppeteer');

(async () => {
  const sessionCookieValue =
    'AQEFALsBAAAAAARtfDUAAAF2Q9WfxwAAAXdeHsayVgAAXnVybjpsaTplbnRlcnByaXNlUHJvZmlsZToodXJuOmxpOmVudGVycHJpc2VBY2NvdW50OjgyNTUzMjQ5LDEwOTc3NzgzNCledXJuOmxpOm1lbWJlcjozMzM4NzI0MjPFqdYeni8mw2seZRcamPMX3jsH_QDED5wMKQl88_E91R9Cf_wX6_sGkIGqSK2mMiAt62d5GXZ68yB9iZYitXLwG_rvNSQw--wJLfXyCOSl8MaL2L63Yog8sh6wGLdaEbukw2lfRJbmHMfBmPEOY_heVbtBDmv19seNR3G1mqDDT1ULjaOQGIiT9eOj7TvNxKlj6bIT';
  const scraper = new LinkedInProfileScraper({
    sessionCookieValue: sessionCookieValue,
    keepAlive: false,
  });

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      "--proxy-server='direct://",
      '--proxy-bypass-list=*',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-features=site-per-process',
      '--enable-features=NetworkService',
      '--allow-running-insecure-content',
      '--enable-automation',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-web-security',
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-speech-api',
      '--disable-sync',
      '--disk-cache-size=33554432',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
  });
  const blockedResources = [
    'image',
    'media',
    'font',
    'texttrack',
    'object',
    'beacon',
    'csp_report',
    'imageset',
  ];

  try {
    const page = await browser.newPage();
    const firstPage = (await browser.pages())[0];
    await firstPage.close();

    await page.goto(
      'https://www.linkedin.com/sales/people/ACwAAANsQ8wBMURDiBAaDxPABjnpPbFHBmP7O8Y,NAME_SEARCH,ScWC?_ntb=EKv8oDTVRleT2GEvfr9Kwg%3D%3D'
    );

    const session = await page.target().createCDPSession();
    await page.setBypassCSP(true);
    await session.send('Page.enable');
    await session.send('Page.setWebLifecycleState', {
      state: 'active',
    });

    const blockedHosts = getBlockedHosts();
    const blockedResourcesByHost = ['script', 'xhr', 'fetch', 'document'];

    await page.setRequestInterception(true);

    page.on('request', (req) => {
      if (blockedResources.includes(req.resourceType())) {
        return req.abort();
      }

      const hostname = getHostname(req.url());

      // Block all script requests from certain host names
      if (
        blockedResourcesByHost.includes(req.resourceType()) &&
        hostname &&
        blockedHosts[hostname] === true
      ) {
        statusLog(
          'blocked script',
          `${req.resourceType()}: ${hostname}: ${req.url()}`
        );
        return req.abort();
      }

      return req.continue();
    });

    await page.setUserAgent(this.options.userAgent);

    await page.setViewport({
      width: 1200,
      height: 720,
    });

    await page.setCookie({
      name: 'li_at',
      value: sessionCookieValue,
      domain: '.www.linkedin.com',
    });

    
  } catch (error) {
    console.log('error', error);
  }
})();

function getBlockedHosts() {
  const blockedHostsArray = blockedHostsList.split('\n');

  let blockedHostsObject = blockedHostsArray.reduce((prev, curr) => {
    const frags = curr.split(' ');

    if (frags.length > 1 && frags[0] === '0.0.0.0') {
      prev[frags[1].trim()] = true;
    }

    return prev;
  }, {});

  blockedHostsObject = {
    ...blockedHostsObject,
    'static.chartbeat.com': true,
    'scdn.cxense.com': true,
    'api.cxense.com': true,
    'www.googletagmanager.com': true,
    'connect.facebook.net': true,
    'platform.twitter.com': true,
    'tags.tiqcdn.com': true,
    'dev.visualwebsiteoptimizer.com': true,
    'smartlock.google.com': true,
    'cdn.embedly.com': true,
  };

  return blockedHostsObject;
}
