import { useEffect, useState } from 'react';
import { Modal, Button, Form, Tab, Tabs, ToastContainer, Toast, Stack } from 'react-bootstrap';
import { useCookies } from 'react-cookie';

import LoadingOverlay from "react-loading-overlay-ts";
import { customFetch } from '../../utils';

import RegistrationForm from './RegistrationForm';
import { socket } from '../../socket';
import { GoogleLogin } from '@react-oauth/google';

export const LoginFormModal = ({ show, onHide, isLoggingIn }) => {
  const [, setCookie] = useCookies(['accessToken', 'refreshToken', 'login_username'])

  const [showNotif, setShowNotif] = useState(false)
  const [responseHeader, setResponseHeader] = useState("")
  const [responseBody, setResponseBody] = useState("")

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    setShowNotif(false)
    const data = {
      login_username: username,
      login_password: password
    }

    customFetch(`${global.server_backend_url}/backend/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then((response) => {
      if (response.ok)
        return response.json(); else throw response;
    }).then((data) => {
      setCookie("login_username", username)
      setCookie("accessToken", data.accessToken)
      setCookie("refreshToken", data.refreshToken)
      setCookie("usertype", data.type)
      onHide(true)
    }).catch(async (err) => {
      /// err.json() returns a Promise, so an async/await is necessary
      const errorBody = await err.json()

      setResponseHeader("Login Failed")
      setResponseBody(errorBody.msg)
      setShowNotif(true)
    })
    // Perform your login logic here
    // For example, you can make an API call to authenticate the user
    // and handle success/failure accordingly
  };

  const handleGoogleLogin = (response) => {
    customFetch(`${global.server_backend_url}/backend/auth/googlelogin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${response.credential}` }
    }).then((response) => {
      if (response.ok)
        return response.json(); else throw response;
    }).then((data) => {
      setCookie("login_username", username)
      setCookie("accessToken", data.accessToken)
      setCookie("refreshToken", data.refreshToken)
      setCookie("usertype", data.type)
      onHide(true)
    }).catch(async (err) => {
      /// err.json() returns a Promise, so an async/await is necessary
      const errorBody = await err.json()

      setResponseHeader("Login Failed")
      setResponseBody(errorBody.msg)
      setShowNotif(true)
    })
  };

  useEffect(() => {
    socket.on("connect_error", (err) => {
      console.log(`Socket.io error due to: ${err.message}`)
      console.log(err)
    });
  }, [])
  return (
    <Modal size='lg' show={show} backdrop="static">
      <Modal.Header>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <LoadingOverlay active={isLoggingIn} spinner>
        <Modal.Body>
          <Tabs defaultActiveForm="login" className="mb-3">
            <Tab eventKey="login" title="Login">
              <ToastContainer className="p-3" position='top-end' style={{ zIndex: 1 }}>
                <Toast show={showNotif} onClose={() => { setShowNotif(false) }} delay={10000} autohide>
                  <Toast.Header>
                    <img
                      src="holder.js/20x20?text=%20"
                      className="rounded me-2"
                      alt=""
                    />
                    <strong className="me-auto">{responseHeader}</strong>
                  </Toast.Header>
                  <Toast.Body>{responseBody}</Toast.Body>
                </Toast>
              </ToastContainer>
              <Form className='d-grid gap-3 mb-3' >
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
              </Form>
              <Stack direction='horizontal' gap={3}>
                <Button variant="primary" type="button" onClick={handleLogin}>
                  Login
                </Button>
                <GoogleLogin onSuccess={handleGoogleLogin} />
              </Stack>
            </Tab>
            <Tab eventKey="register" title="Register">
              <RegistrationForm />
            </Tab>
          </Tabs>
        </Modal.Body>
      </LoadingOverlay>

    </Modal>
  );
};
