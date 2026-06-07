import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setUser } from "../../redux/reducers/userReducer";
import axios from "axios";

import { Button, Form, Input, Card, Popover, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";

import "./ Setup.css";
import { api } from "../../api";

type AdminType = {
  username?: string;
  password?: string;
  email?: string;
  remember?: string;
};

type Library = {
  name?: string;
  path?: string;
  remember?: string;
};

export const Setup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAdminPopoverOpen, setIsAdminPopoverOpen] = useState(false);
  const [isLibPopoverOpen, setIsLibPopoverOpen] = useState(false);
  const [isAdminRegistered, setIsAdminRegistered] = useState(false);

  useEffect(() => {
    axios
      .post("/api/auth/admin/register", {
        username: "",
        email: "",
        password: "",
      })
      .then((response) => {
        console.log(response.data.code);
      })
      .catch((error) => {
        const code = error.response.data[0].code;
        if (code === "AdminAlreadyExists") setIsAdminRegistered(true);
      });
  }, [isAdminRegistered]);

  const onFinish: FormProps<AdminType>["onFinish"] = (values) => {
    console.log("Success:", values);
    axios
      .post("/api/auth/admin/register", {
        username: values.username,
        email: values.email,
        password: values.password,
      })
      .then((_) => {
        setIsAdminRegistered(true);
        axios
          .post("/api/auth/login", {
            username: values.username,
            password: values.password,
          })
          .then((response) => {
            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(setUser({ userName: values.username!, isLoggedIn: true }));
          })
          .catch((error) => {
            console.error(error.message);
            console.error(error.response);
          });
      })
      .catch((error) => {
        console.error(error);
        console.error(error.response.data.message);
      });
  };

  const setPath: FormProps<Library>["onFinish"] = (values) => {
    console.log(values.path);
    api
      .post("/Library/createLibrary", {
        name: values.name,
        libraryPath: values.path,
      })
      .then((_) => {
        api
          .post(`/Config/markSetupAsComplete?isComplete=true`)
          .then((response) => {
            console.log(response.data);
            navigate("/");
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="setupContainer">
      <div className="setupTitle">
        <h1>LibreStack Initial Setup</h1>
      </div>
      <div className="setupArea">
        <div className="setupEntry">
          <Card
            title="Create Admin User"
            variant="outlined"
            size="medium"
            style={{ textAlign: "center" }}
            extra={
              <Popover
                title="Info"
                trigger="click"
                autoAdjustOverflow={true}
                placement="top"
                open={isAdminPopoverOpen}
                onOpenChange={() => setIsAdminPopoverOpen(false)}
                content={
                  <Typography.Paragraph type="secondary">
                    Admin User account can only be created once on
                    initialization of LibreStack. Other user accounts can be
                    assigned admin access later.
                  </Typography.Paragraph>
                }
              >
                <Button
                  onClick={() => setIsAdminPopoverOpen(true)}
                  icon={<InfoCircleOutlined />}
                  style={{ marginLeft: "0.5em" }}
                ></Button>
              </Popover>
            }
          >
            {isAdminRegistered && (
              <Typography.Paragraph>
                Admin Account Registered
              </Typography.Paragraph>
            )}
            {!isAdminRegistered && (
              <Form
                name="createAdmin"
                labelCol={{ span: 12 }}
                style={{ maxWidth: "100%" }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item<AdminType>
                  label="Admin Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Input admin account user name",
                    },
                  ]}
                >
                  <Input placeholder="admin" />
                </Form.Item>
                <Form.Item<AdminType>
                  label="Admin Email"
                  name="email"
                  rules={[
                    { required: true, message: "Input admin account email" },
                  ]}
                >
                  <Input type={"email"} />
                </Form.Item>
                <Form.Item<AdminType>
                  label="Admin Password"
                  name="password"
                  rules={[
                    { required: true, message: "Input admin account password" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item label={null}>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Card>
        </div>
        <div className="setupEntry">
          <Card
            title="Create Initial Library"
            variant="outlined"
            size="medium"
            style={{ textAlign: "center" }}
            extra={
              <Popover
                title="Info"
                trigger="click"
                autoAdjustOverflow={true}
                placement="top"
                open={isLibPopoverOpen}
                onOpenChange={() => setIsLibPopoverOpen(false)}
                content={
                  <Typography.Paragraph type="secondary">
                    LibreStack requires at least one library.
                  </Typography.Paragraph>
                }
              >
                <Button
                  onClick={() => setIsLibPopoverOpen(true)}
                  icon={<InfoCircleOutlined />}
                  style={{ marginLeft: "0.5em" }}
                ></Button>
              </Popover>
            }
          >
            <Form
              name="setLibraryPath"
              labelCol={{ span: 12 }}
              style={{ maxWidth: "100%" }}
              initialValues={{ remember: true }}
              onFinish={setPath}
              autoComplete="off"
            >
              <Form.Item<Library>
                label="Library Name"
                name="name"
                rules={[{ required: true, message: "Library Name" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item<Library>
                label="Library Path"
                name="path"
                rules={[
                  {
                    required: true,
                    message: "Input Library Path",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};
