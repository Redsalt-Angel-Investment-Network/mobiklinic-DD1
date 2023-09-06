import * as React from 'react';
import {AuthProvider} from './contexts/auth';

import AppNav from './navigators/AppNav';
import {DataResultsProvider} from './contexts/DataResultsContext';
import {ChatProvider} from './contexts/ChatContext';
import * as Ably from 'ably';
import {AblyProvider, useChannel, usePresence} from 'ably/react';

const client = {
  key: 'ihV9jA.Kzjl9g:Iy4pvjQbZyde1N0ER5JgjDsgKpg0FUa6YIm_f7l1ju0',
  clientId: 'ihV9jA',
};

const Entry = () => {
  React.useEffect(() => {
    //clearStorage();
    //autoLogin()
  }, []);

  // Check if the user is logged in,
  // if yes, navigate to the app
  // if no, navigate to the login screen
  // To login the user, we need to send the user's credentials to the server
  // and get a token back
  //If network error, retrieve users from local storage
  // Compare users to the logged in user
  // If the user is found, login the user and navigate to the app.
  // If the user is not found, show an error message
  return (
    <DataResultsProvider>
      <AblyProvider client={client}>
        <ChatProvider>
          <AuthProvider>
            <AppNav />
          </AuthProvider>
        </ChatProvider>
      </AblyProvider>
    </DataResultsProvider>
  );
};

export default Entry;
