export interface GoogleApiClient {
  load: (api: string, callback: () => void) => void;
  init: (options: {
    apiKey: string;
    clientId?: string;
    discoveryDocs?: string[];
    scope?: string;
  }) => void;
  auth2: {
    getAuthInstance: () => any;
  };
  client: {
    sheets: {
      spreadsheets: {
        values: {
          append: (params: {
            spreadsheetId: string;
            range: string;
            valueInputOption: string;
            insertDataOption?: 'INSERT_ROWS' | 'OVERWRITE';
            resource: {
              values: any[][];
            };
          }) => Promise<any>;
        };
      };
    };
  };
}

export interface GoogleAccounts {
  id: {
    initialize: (options: any) => void;
    renderButton: (element: HTMLElement, options: any) => void;
    prompt: () => void;
  };
  oauth2: {
    initTokenClient: (params: {
      client_id: string;
      scope: string;
      callback: (response: any) => void;
    }) => any;
  };
}

declare global {
  interface Window {
    gapi: GoogleApiClient;
    google: {
      accounts: GoogleAccounts;
    };
  }
} 