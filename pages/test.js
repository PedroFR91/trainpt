import React, { useState } from 'react'
import styles from '../styles/test.module.css'
import { UserOutlined } from '@ant-design/icons';
import { Menu, Card, Avatar, Space, Breadcrumb, List, Calendar, theme, Image } from "antd";
import { Typography } from "antd";

const items = [
    {
        label: 'Inicio',
        key: 'start',
    },
    {
        label: 'Mi perfil',
        key: 'profile',


    },
    {
        label: 'Archivos',
        key: 'files',

    },
    {
        label: 'Rutina',
        key: 'routine',

    },
];
const data = [
    {
        title: 'Ant Design Title 1',
    },
    {
        title: 'Ant Design Title 2',
    },
    {
        title: 'Ant Design Title 3',
    },
    {
        title: 'Ant Design Title 4',
    },
];
const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
};
const { Meta } = Card;
const { Paragraph } = Typography;
const test = () => {
    const [current, setCurrent] = useState('mail');
    const [clickTriggerStr, setClickTriggerStr] = useState(
        'Text or icon as trigger - click to start editing.',
    );
    const [chooseTrigger, setChooseTrigger] = useState(['icon']);
    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
    }

    const { token } = theme.useToken();
    const wrapperStyle = {
        width: 300,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };
    console.log(current)
    return (
        <div className={styles.trainerContainer}>
            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
            {current === 'start' && <>
                <List>
                    <Card style={{
                        width: '100%',
                    }} >
                        <Space><Avatar size={64} icon={<UserOutlined />} /><Breadcrumb
                            items={[
                                {
                                    title: 'Nombre',
                                },
                                {
                                    title: <a href="">Plan</a>,
                                },
                                {
                                    title: <a href="">Status</a>,
                                },
                                {
                                    title: 'Pagado?',
                                },
                            ]}
                        /></Space>
                    </Card>
                    <Card style={{
                        width: '100%',
                    }} >
                        <Space><Avatar size={64} icon={<UserOutlined />} /><Breadcrumb
                            items={[
                                {
                                    title: 'Nombre',
                                },
                                {
                                    title: <a href="">Plan</a>,
                                },
                                {
                                    title: <a href="">Status</a>,
                                },
                                {
                                    title: 'Pagado?',
                                },
                            ]}
                        /></Space>
                    </Card>
                    <Card style={{
                        width: '100%',
                    }} >
                        <Space><Avatar size={64} icon={<UserOutlined />} /><Breadcrumb
                            items={[
                                {
                                    title: 'Nombre',
                                },
                                {
                                    title: <a href="">Plan</a>,
                                },
                                {
                                    title: <a href="">Status</a>,
                                },
                                {
                                    title: 'Pagado?',
                                },
                            ]}
                        /></Space>
                    </Card>
                </List>
                <div style={wrapperStyle}>
                    <Calendar fullscreen={false} onPanelChange={onPanelChange} />
                </div>

            </>}
            {current === 'profile' && <>
                <Card><Space>
                    <Avatar size={64} icon={<UserOutlined />} />
                    <Paragraph
                        editable={{
                            tooltip: 'click to edit text',
                            onChange: setClickTriggerStr,
                            triggerType: chooseTrigger,
                        }}
                    >
                        {clickTriggerStr}
                    </Paragraph>
                </Space></Card>
                <Space direction="vertical" size={16}>
                    <Card
                        title="Sobre mí..."
                        extra={<a href="#">More</a>}
                        style={{
                            width: 300,
                        }}
                    >
                        <h1>Card content</h1>
                        <p>Card content</p>
                        <Image
                            width={200}
                            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"

                        />
                    </Card>

                </Space></>}
            {current === 'files' && <>
                <Card
                    hoverable
                    style={{
                        width: 240,
                    }}
                    cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
                >
                    <Meta title="Europe Street beat" description="www.instagram.com" />
                </Card>
                <Card
                    extra={<a href="https://www.youtube.com/watch?v=WCcqnFRF9YA">More</a>}
                    hoverable
                    style={{
                        width: 240,
                    }}
                    cover={<video alt="example" src="https://videos.pexels.com/video-files/4438098/4438098-hd_1080_1830_25fps.mp4" />}
                >
                    <Meta title="Europe Street beat" description="www.instagram.com" />
                </Card>
                <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                title={<a href="https://ant.design">{item.title}</a>}
                                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                            />
                        </List.Item>
                    )}
                />
            </>}
            {current === 'routine' && <></>}
        </div>
    )
}

export default test