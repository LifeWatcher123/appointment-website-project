import { useEffect, useState } from "react";
import "./App.css";
import "./Custom.scss";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Container,
  Nav,
  NavDropdown,
  Navbar,
  Row,
  Stack,
  ListGroup,
  ButtonGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { LoginFormModal } from "./components/LoginFormModal";
import LoadingOverlay from "react-loading-overlay-ts";
import { AdminTools } from "./components/AdminTools";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { customFetch } from "./utils";

import Cookies from "js-cookie";

const TopBar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggleClick = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode)
      document.documentElement.setAttribute("data-bs-theme", "dark");
    else document.documentElement.setAttribute("data-bs-theme", "light");
  }, [darkMode]);

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container className="justify-contents-between">
        <>
          <Navbar.Brand href="#home">Integrated School</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </>
        <Button onClick={handleDarkModeToggleClick}>
          {darkMode ? (
            <>
              <i className="bi bi-moon-stars-fill" /> Dark
            </>
          ) : (
            <>
              <i className="bi bi-brightness-high" /> Light
            </>
          )}
        </Button>
      </Container>
    </Navbar>
  );
};

type SidebarColBtnType = {
  name: string;
  iconClass: string;
  value: string;
  link: string;
};
const SidebarCol = () => {
  const [radioValue, setRadioValue] = useState("1");

  const radios: SidebarColBtnType[] = [
    { name: "Dashboard", iconClass: "bi-columns-gap", value: "1", link: "/" },
    {
      name: "Appointments",
      iconClass: "bi-clipboard",
      value: "2",
      link: "/appointments",
    },
    {
      name: "Feedback",
      iconClass: "bi-graph-up",
      value: "3",
      link: "/feedback",
    },
    {
      name: "Admin Tools",
      iconClass: "bi-terminal",
      value: "4",
      link: "/admin",
    },
  ];

  return (
    <Col
      sm={6}
      lg={{ span: 3, order: "1" }}
      className="sidebar-offcanvas"
      id="sidebar"
    >
      <div>
        <ButtonGroup className="d-grid gap-2">
          {radios.map((radio, idx) => (
            <SidebarColBtn
              idx={idx}
              key={idx}
              name={radio.name}
              iconClass={radio.iconClass}
              value={radio.value}
              radioValue={radioValue}
              setRadioValue={setRadioValue}
              link={radio.link}
            />
          ))}
        </ButtonGroup>
      </div>
    </Col>
  );
};

const SidebarColBtn = ({
  idx,
  name,
  iconClass,
  value,
  radioValue,
  setRadioValue,
  link,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button
      key={idx}
      variant={link === location.pathname ? "primary" : "secondary"}
      name="radio"
      value={value}
      onClick={(e) => {
        navigate(link);
        setRadioValue(e.currentTarget.value);
      }}
      size="lg"
      className="shadow-sm rounded-pill"
      style={{ fontSize: "1.5rem" }}
    >
      <i className={`bi ${iconClass} mx-2`}></i>
      {name}
    </Button>
  );
};

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const sidebarbtn_onClick = () => setIsActive(!isActive);
  const mainRowClassName = `row-offcanvas row-offcanvas-left ${
    isActive ? "active" : ""
  }`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogInDone, setIsLogInDone] = useState(false);

  const getLoggedInStatus = () => {
    const data = { refreshToken: Cookies.get("refreshToken") };

    customFetch(`${global.server_backend_url}/backend/auth/refreshToken`, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          setIsLoggedIn(false);
          setIsLogInDone(true);
        }
        throw response;
      })
      .then((data) => {
        Cookies.set("accessToken", data.accessToken);
        Cookies.set("refreshToken", data.refreshToken);
        setIsLoggedIn(true);
        setIsLogInDone(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => getLoggedInStatus(), []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      getLoggedInStatus();
      // console.log('This code runs every 1 minute');
    }, 60000);
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <BrowserRouter>
      <LoadingOverlay spinner active={!isLogInDone}>
        <TopBar />
        <LoginFormModal
          show={!isLoggedIn}
          onHide={setIsLoggedIn}
          isLoggingIn={!isLogInDone}
        />
        <Stack className="pt-4 px-2 bg-body">
          <Container fluid>
            <Row className={mainRowClassName}>
              <Col sm={12} lg={{ span: 6, order: 3 }} id="ui-body">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Dashboard sidebarbtn_onClick={sidebarbtn_onClick} />
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <Appointments sidebarbtn_onClick={sidebarbtn_onClick} />
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminTools sidebarbtn_onClick={sidebarbtn_onClick} />
                    }
                  />
                </Routes>
              </Col>
              <SidebarCol />
              <Col
                sm={12}
                lg={{ span: 3, order: "last" }}
                style={{ marginBottom: "3rem" }}
              >
                <Card className="shadow-sm">
                  <Card.Header as={"h2"}>People Online</Card.Header>
                  <Card.Body>
                    <ListGroup>
                      {/* <ListGroup.Item>Cras justo odio</ListGroup.Item> */}
                      {/* <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item> */}
                      {/* <ListGroup.Item>Morbi leo risus</ListGroup.Item> */}
                      {/* <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item> */}
                      {/* <ListGroup.Item>Vestibulum at eros</ListGroup.Item> */}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Stack>
      </LoadingOverlay>
    </BrowserRouter>
  );
};

export default App;
