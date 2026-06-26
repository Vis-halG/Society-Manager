import React from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import AppRoot from './src/AppRoot';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './src/theme/ionic.css';

setupIonicReact();

export default function App() {
  return (
    <IonApp className="sm-ionic-app">
      <AppRoot />
    </IonApp>
  );
}
