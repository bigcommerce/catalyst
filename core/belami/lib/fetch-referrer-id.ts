export const getReferrerID = async (
  ua: string,
  ip: string,
  sid: number = 0,
  scid: number = 0,
  log: number = 1,
) => {
  const response = await fetch(`https://as-nc-inf-referrerid-live.azurewebsites.net/referrerid`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      UserHostAddress: ip,
      UserAgent: ua,
      SessionID: sid,
      SiteConfigID: scid,
      LogRecord: log,
    }),
    cache: 'no-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data?.isSuccess ? data.data : null;
};

export const storeReferrerLog = async (
  referrerID: number,
  source: string,
  keywords: string,
  cid: string,
  referrer: string,
  ip: string,
  page: string,
) => {
  const response = await fetch(`https://as-nc-inf-referrerid-live.azurewebsites.net/referrerlog`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ReferrerID: referrerID,
      SearchSource: source,
      SearchKW: keywords,
      ClickID: cid,
      ClientReferrer: referrer,
      IPLog: ip,
      LandingPage: page,
      CategoryTypeID: 0,
      CategoryID: 0,
      SubCategoryID: 0,
      MfgID: 0,
      ProductID: 0,
      InTest: 0,
      LogType: 0,
    }),
    cache: 'no-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data?.isSuccess ? data.data : null;
};
