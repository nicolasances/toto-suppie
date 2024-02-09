import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { ListScreen } from './screens/ListScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TeachScreen } from './screens/TeachScreen';
import { getStoredUserToken, googleSignIn } from './auth/AuthUtil';
import { AuthAPI } from './api/AuthAPI';

const App: React.FC = () => {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)

  /**
   * Verifies if the user is authenticated
   */
  const verifyAuthentication = async () => {

    // Get the user from local storage
    const user = getStoredUserToken()

    // Login is needed if the user is not in local storage
    if (!user) {

      console.log("No user or Id Token found. Login needed.");

      setLoginNeeded(true)

      return;

    }

    // The user is stored in local storage
    // Verify its token
    console.log("Verifying Id Token");
    const verificationResult = await new AuthAPI().verifyToken(user.idToken)

    // Check that the token hasn't expired
    if (verificationResult.name == "TokenExpiredError") {

      console.log("JWT Token Expired");

      // If the token has expired, you need to login
      setLoginNeeded(true);

      return;

    }

    setLoginNeeded(false);

    console.log("Token successfully verified.");
    
  }

  /**
   * Triggers the Google SignIn process
   */
  const triggerSignIn = () => {

    if (loginNeeded === true) googleSignIn()

  }

  useEffect(() => { verifyAuthentication() }, [])
  useEffect(triggerSignIn, [loginNeeded])

  // Empty screen while Google SignIn is loading
  if (loginNeeded == null) return (<div></div>)

  if (loginNeeded === true) return (<div></div>)

  return (

    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/list" element={<ListScreen />} />
        <Route path="/shop" element={<ShopScreen />} />
        <Route path="/teach" element={<TeachScreen />} />
      </Routes>
    </Router>
  );
};

export default App