import React from 'react';
import signUp from '../screens/signup';
import forgotPassword from '../screens/password.forgot';
import PasswordReset from '../screens/password.reset';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../screens/login';
import ForgotPassword from '../screens/password.forgot';
import ResetPassword from '../screens/password.reset';
import DrawerLogged from '../navigators/drawer.logged';


const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
          // animationTypeForReplace: state.isSignout ? "pop" : "push",
        }}
      />
      <Stack.Screen
        name="signUp"
        options={{headerShown: false}}
        component={signUp}
      />
      {/* <Stack.Screen
				name="forgotPassword"
				options={{ headerShown: false }}
				component={forgotPassword}
			/>
			<Stack.Screen
				name="resetPassword"
				options={{ headerShown: false }}
				component={PasswordReset}
			/> */}
      <Stack.Screen
        name="ForgotPassword"
        options={{headerShown: false}}
        component={ForgotPassword}
      />
      <Stack.Screen
        name="ResetPassword"
        options={{headerShown: false}}
        component={ResetPassword}
      />
          {/* <Stack.Screen
        name="DrawerLogged"
        options={{headerShown: false}}
        component={DrawerLogged}
      /> */}
    </Stack.Navigator>
  );
}

export default AppStack;
