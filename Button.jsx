import React from "react";
import * as usersService from "../../services/usersService";
// import * as profileService from "../../services/profileService";
import img1 from "../../assets/images/background/login-register.jpg";
import { CustomInput, Button, Row, Col } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as usersSchema from "./usersSchema";
import "../../assets/scss/style.css";
import Facebook from "./Facebook";
import PropTypes from "prop-types";
import LoginWithGoogle from "./LoginWithGoogle";
import { logger } from "./common";
import { withRouter } from "react-router";
import SweetAlertWarning from "../ui/SweetAlertWarning";

const _logger = logger.extend("Login");
const backgroundImage = {
  backgroundImage: "url(" + img1 + ")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center bottom",
  backgroundSize: "cover"
};

class Login extends React.Component {
  constructor(props) {
    _logger("constructor", props);
    super(props);
    this.state = {
      errorLogin: "",
      user: "",
      showForgot: false,
      recoveryEmail: "",
      recoveryEmailSent: false
    };
    this.state.initialValues = usersSchema.loginInitialValues;
    this.state.validationSchema = usersSchema.loginValidationSchema;
  }

  loginUser = (values, { setSubmitting }) => {
    usersService
      .login(values)
      .then(this.loginSuccess)
      .catch(this.loginError)
      .then(() => {
        setSubmitting(false);
      });
  };

  loginSuccess = () => {
    // usersService.getUserByToken(res.item);
    usersService.currentUser().then(data => {
      _logger(data);
      this.getUserRoles();
    });
  };

  loginError = error => {
    _logger(error);
    if (error.response.status === 405) {
      this.setState({
        errorLogin: "Please confirm your email before logging in."
      });
    } else
      this.setState({
        errorLogin: "Invalid email/password. Please try again."
      });
  };

  getUserRoles = () => {
    usersService
      .currentUser()
      .then(this.onGetUserRolesSuccess)
      .catch(this.onGetUserRolesError);
  };

  onGetUserRolesSuccess = response => {
    _logger(response.item.roles);
    const productUrl = window.sessionStorage.getItem("cachedProductUrl");
    if (productUrl) {
      this.props.history.push(JSON.parse(productUrl), {
        action: "GETTINGROLES",
        roles: response.item.roles
      });
    } else {
      this.props.history.push("/dashboard/customer", {
        action: "GETTINGROLES",
        roles: response.item.roles
      });
    }
  };

  onGetUserRolesError = error => {
    _logger(error);
  };

  handleClick = () => {
    this.state.showForgot
      ? this.setState({
          showForgot: false
        })
      : this.setState({
          showForgot: true
        });
  };

  handleChange = evt => {
    this.setState({
      recoveryEmail: evt.target.value
    });
  };

  passwordRecovery = () => {
    usersService
      .recoverPassword(this.state.recoveryEmail)
      .then(this.recoverPasswordSuccess)
      .catch(this.recoverPasswordError);
  };

  recoverPasswordSuccess = () => {
    this.setState({
      recoveryEmailSent: true
    });
  };

  recoverPasswordError = err => {
    _logger(err);
  };

  sweetAlertConfirm = () => {
    this.setState({
      recoveryEmailSent: false,
      showForgot: false
    });
  };

  render() {
    _logger("render");
    return (
      <div id="wrapper">
        <div
          className="login-register auth-wrapper d-flex no-block justify-content-center align-items-center"
          style={backgroundImage}
        >
          <div style={{ width: "400px" }}>
            <div className="card blog-widget">
              <div className="card-body">
                <img
                  src="https://sabio-s3.s3.us-west-2.amazonaws.com/outlayr/2c809a4a-4b06-4906-8553-01cea3833167-outlayr-logo.png"
                  alt="Outlayr Logo"
                  width="100%"
                  className="img-responsive"
                />
                {this.state.showForgot ? (
                  <form className="form-horizontal">
                    <div className="form-group ">
                      <div className="col-xs-12">
                        <h3 className="font-medium mb-3">Recover Password</h3>
                        <p className="text-muted">
                          Enter your Email and instructions will be sent to you!{" "}
                        </p>
                      </div>
                    </div>
                    <div className="form-group ">
                      <div className="col-xs-12">
                        <input
                          name="recoveryEmail"
                          className="form-control"
                          type="email"
                          required=""
                          placeholder="Email"
                          value={this.state.recoveryEmail}
                          onChange={this.handleChange}
                        />{" "}
                      </div>
                    </div>
                    <Row className="mt-3">
                      <Col xs="12">
                        <Button
                          className="btn btn-danger btn-lg btn-block text-uppercase waves-effect waves-light"
                          type="button"
                          onClick={this.passwordRecovery}
                        >
                          Reset
                        </Button>
                        <Button
                          className="btn btn-info btn-md btn-block text-uppercase waves-effect waves-light"
                          type="button"
                          onClick={this.handleClick}
                        >
                          Go Back
                        </Button>
                      </Col>
                    </Row>
                  </form>
                ) : (
                  <div className="form-horizontal form-material">
                    <h3 className="box-title m-b-20">Sign In</h3>
                    <div style={{ color: "red" }}>{this.state.errorLogin}</div>

                    <Formik
                      validationSchema={this.state.validationSchema}
                      initialValues={this.state.initialValues}
                      onSubmit={this.loginUser}
                      render={({
                        values,
                        touched,
                        errors,
                        dirty,
                        isSubmitting
                      }) => (
                        <Form>
                          <div className="form-group ">
                            {" "}
                            <div className="col-xs-12">
                              <Field
                                name="email"
                                className="form-control"
                                type="text"
                                placeholder="Email"
                                autoComplete="username"
                                value={values.email}
                              />
                              {errors.email && touched.email ? (
                                <div style={{ color: "red" }}>
                                  {errors.email}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="form-group">
                            <div className="col-xs-12">
                              <Field
                                name="password"
                                className="form-control"
                                type="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={values.password}
                              />
                              {errors.password && touched.password ? (
                                <div style={{ color: "red" }}>
                                  {errors.password}
                                </div>
                              ) : null}
                            </div>
                            <div className="d-flex no-block align-items-center mb-3">
                              <CustomInput
                                type="checkbox"
                                id="exampleCustomCheckbox"
                                label="Remember Me"
                              />
                              <div className="ml-auto">
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={this.handleClick}
                                  className="forgot text-dark float-right"
                                >
                                  <i className="fa fa-lock mr-1" /> Forgot pwd?
                                </div>
                              </div>
                            </div>
                            <div className="form-group text-center m-t-20">
                              <div className="col-xs-12">
                                <button
                                  className="btn btn-info btn-lg btn-block text-uppercase waves-effect waves-light"
                                  type="submit"
                                  disabled={isSubmitting || !dirty}
                                >
                                  Log In
                                </button>
                              </div>
                            </div>
                          </div>
                        </Form>
                      )}
                    />

                    <div className="social btn-group-lg row">
                      <div className="text-center mb-2 col-12">
                        <Facebook
                          history={this.props.history}
                          getUserRoles={this.getUserRoles}
                        />
                      </div>
                      <div className="text-center mb-2 col-12">
                        <LoginWithGoogle
                          history={this.props.history}
                          getUserRoles={this.getUserRoles}
                        />
                      </div>
                    </div>
                    <div className="form-group m-b-0">
                      <div className="col-sm-12 text-center">
                        {"Don't have an account? "}
                        <a href="/register" className="text-info m-l-5">
                          <b>Sign Up</b>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {this.state.recoveryEmailSent && (
              <SweetAlertWarning
                title="Recovery email sent!"
                type="success"
                confirmAction={this.sweetAlertConfirm}
                message="The instructions to reset your password has been sent to your email inbox!"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired
};

export default withRouter(Login);
