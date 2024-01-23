import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
// import DrawerNavigationLogged from './drawer.logged';
import Diagnose from '../screens/diagnosis';
import Ambulances from '../screens/ambulance';
import Doctors from '../screens/doctors';
import ViewDiagnosis from '../screens/diagnosis.view';
import NewDiagnosis from '../screens/diagnosis.new';
import FollowUp from '../screens/diagnosis.follow.up';
import Chat from '../screens/Chat';
import Chats from '../screens/Chats';
import Profile from '../screens/profile';
import PatientData from '../simprints/patient.data';
import SimprintsConnect from '../simprints/simprintsID';
import PatientMedical from '../simprints/patient.medical';
import Vaccination from '../simprints/vaccination';
import SelectActivity from '../simprints/select.activity';
// import PatientSummary from '../simprints/patient.summary';
import GetPatients from '../simprints/getPatients';
import PatientLists from '../simprints/patient.lists';
import AntenatalCare from '../simprints/antenatal.care';
import SelectAction from '../simprints/select.action';
import ReceivedChats from '../screens/Received.Chats';
import ForgotPassword from '../screens/password.forgot';
import Appointments from '../screens/Appointments';
import Dashboard from '../screens/dashboard';
import DrawerLogged from '../navigators/drawer.logged';
import Urinalysis from '../renal/urinalysis';
import Monitoring from '../renal/monitoring';
import History from '../renal/history';
import Inspection from '../renal/inspection';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        options={{headerShown: false}}
        component={Dashboard}
      />
      <Stack.Screen
        name="Doctors"
        options={{headerShown: false}}
        component={Doctors}
      />
      <Stack.Screen
        name="Ambulances"
        options={{headerShown: false}}
        component={Ambulances}
      />
      {/* <Stack.Screen
        name="Diagnose"
        options={{headerShown: false}}
        component={Diagnose}
      /> */}
      <Stack.Screen
        name="ViewDiagnosis"
        options={{headerShown: false}}
        component={ViewDiagnosis}
      />
      <Stack.Screen
        name="NewDiagnosis"
        options={{headerShown: false}}
        component={NewDiagnosis}
      />
      <Stack.Screen
        name="FollowUp"
        options={{headerShown: false}}
        component={FollowUp}
      />
      <Stack.Screen
        name="Chats"
        options={{headerShown: false}}
        component={Chats}
      />
      <Stack.Screen
        name="Chat"
        options={{headerShown: false}}
        component={Chat}
      />
      <Stack.Screen
        name="Profile"
        options={{headerShown: false}}
        component={Profile}
      />
      <Stack.Screen
        name="PatientData"
        options={{headerShown: false}}
        component={PatientData}
      />
      <Stack.Screen
        name="SimprintsConnect"
        options={{headerShown: false}}
        component={SimprintsConnect}
      />
      <Stack.Screen
        name="PatientMedical"
        options={{headerShown: false}}
        component={PatientMedical}
      />
      <Stack.Screen
        name="Vaccination"
        options={{headerShown: false}}
        component={Vaccination}
      />
      <Stack.Screen
        name="SelectActivity"
        options={{headerShown: false}}
        component={SelectActivity}
      />

      <Stack.Screen
        name="GetPatients"
        options={{headerShown: false}}
        component={GetPatients}
      />
      <Stack.Screen
        name="PatientLists"
        options={{headerShown: false}}
        component={PatientLists}
      />
      <Stack.Screen
        name="AntenatalCare"
        options={{headerShown: false}}
        component={AntenatalCare}
      />
      <Stack.Screen
        name="SelectAction"
        options={{headerShown: false}}
        component={SelectAction}
      />
      <Stack.Screen
        name="ReceivedChats"
        options={{headerShown: false}}
        component={ReceivedChats}
      />
      <Stack.Screen
        name="Appointments"
        options={{headerShown: false}}
        component={Appointments}
      />
      <Stack.Screen
        name="DrawerLogged"
        options={{headerShown: false}}
        component={DrawerLogged}
      />
      <Stack.Screen
        name="Urinalysis"
        options={{headerShown: false}}
        component={Urinalysis}
      />
      <Stack.Screen
        name="Monitoring"
        options={{headerShown: false}}
        component={Monitoring}
      />
      <Stack.Screen
        name="DrawerLogged"
        options={{headerShown: false}}
        component={DrawerLogged}
      />
      <Stack.Screen
        name="History"
        options={{headerShown: false}}
        component={History}
      />

      <Stack.Screen
        name="Inspection"
        options={{headerShown: false}}
        component={Inspection}
      />
    </Stack.Navigator>
  );
}

export default AuthStack;
