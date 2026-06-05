import { useState } from "react";
import axios from "axios";

import { Button, Form, Input, Card, Popover, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";

import "./ Setup.css";

type AdminType = {
  username?: string;
  password?: string;
  email?: string;
  remember?: string;
};

export const Setup: React.FC = () => {
  // const [adminUser, setAdminUser] = useState<string>("");
  // const [adminPassword, setAdminPassword] = useState<string>("");
  // const [adminEmail, setAdminEmail] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const onFinish: FormProps<AdminType>["onFinish"] = (values) => {
    console.log("Success:", values);
    axios
      .post("/api/auth/admin/register", {
        username: values.username,
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
        console.error(error.response.data.message);
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
                open={isPopoverOpen}
                onOpenChange={() => setIsPopoverOpen(false)}
                content={
                  <Typography.Paragraph type="secondary">
                    Admin User account can only be created once on
                    initialization of LibreStack. Other user accounts can be
                    assigned admin access later.
                  </Typography.Paragraph>
                }
              >
                <Button
                  onClick={() => setIsPopoverOpen(true)}
                  icon={<InfoCircleOutlined />}
                ></Button>
              </Popover>
            }
          >
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
                  { required: true, message: "Input admin account user name" },
                ]}
              >
                <Input
                // onChange={(e) => setAdminUser(e.target.value)}
                />
              </Form.Item>
              <Form.Item<AdminType>
                label="Admin Email"
                name="email"
                rules={[
                  { required: true, message: "Input admin account email" },
                ]}
              >
                <Input
                  type={"email"}
                  // onChange={(e) => setAdminEmail(e.target.value)}
                />
              </Form.Item>
              <Form.Item<AdminType>
                label="Admin Password"
                name="password"
                rules={[
                  { required: true, message: "Input admin account password" },
                ]}
              >
                <Input.Password
                // onChange={(e) => setAdminPassword(e.target.value)}
                />
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
