interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    init: (options: { apiKey: string, clientId?: string, discoveryDocs?: string[], scope?: string }) => void;
    auth2: {
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        signIn: () => Promise<any>;
        signOut: () => Promise<any>;
        currentUser: {
          get: () => {
            getAuthResponse: () => {
              access_token: string;
            };
          };
        };
      };
    };
    client: {
      init: (options: { apiKey: string, clientId?: string, discoveryDocs?: string[], scope?: string }) => Promise<void>;
      load: (api: string, version: string) => Promise<void>;
      setToken: (token: { access_token: string }) => void;
      sheets: {
        spreadsheets: {
          get: (params: { spreadsheetId: string }) => Promise<any>;
          batchUpdate: (params: any) => Promise<any>;
          values: {
            get: (params: { spreadsheetId: string, range: string }) => Promise<{
              result: {
                values: any[][];
              };
            }>;
            update: (params: { spreadsheetId: string, range: string, valueInputOption: string, resource: { values: any[][] } }) => Promise<any>;
            append: (params: { 
              spreadsheetId: string, 
              range: string, 
              valueInputOption: string, 
              insertDataOption?: 'INSERT_ROWS' | 'OVERWRITE',
              resource: { values: any[][] } 
            }) => Promise<any>;
            clear: (params: { spreadsheetId: string, range: string }) => Promise<any>;
          };
        };
      };
    };
  };
  google: {
    accounts: {
      id: {
        initialize: (options: any) => void;
        renderButton: (element: HTMLElement, options: any) => void;
        prompt: () => void;
      };
      oauth2: {
        initTokenClient: (params: { 
          client_id: string, 
          scope: string, 
          callback: (response: any) => void 
        }) => {
          requestAccessToken: () => void;
        };
      };
    };
  };
} 