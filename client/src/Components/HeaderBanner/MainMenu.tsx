import { useState } from "react";

import { Dropdown, Button, Segmented } from "antd";
import type { MenuProps } from "antd";
import { SmileOutlined, MenuOutlined } from "@ant-design/icons";

export const MainMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <Button>Button</Button>,
    },
    {
      key: "2",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.aliyun.com"
        >
          2nd menu item (disabled)
        </a>
      ),
      icon: <SmileOutlined />,
      disabled: true,
    },
    {
      key: "3",
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.luohanacademy.com"
        >
          3rd menu item (disabled)
        </a>
      ),
      disabled: true,
    },
    {
      key: "5",
      label: (
        <Segmented
          options={["Light", "Dark", "System"]}
          onChange={(value) => {
            console.log(value);
          }}
        ></Segmented>
      ),
    },
  ];

  return (
    <Dropdown
      placement="bottomLeft"
      trigger={["click"]}
      menu={{ items }}
      open={isOpen}
    >
      <Button
        variant="solid"
        color="primary"
        ghost
        size="large"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuOutlined />
      </Button>
    </Dropdown>
  );
};
