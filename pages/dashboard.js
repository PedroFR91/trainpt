// pages/Dashboard.js
import { Layout, FloatButton, Badge, Modal } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/layout/Sidebar';
import DashboardHeader from '../components/layout/Header';
import Chat from '../components/chat/chat';
import AuthContext from '../context/AuthContext';
import HomeSection from '../components/trainer/HomeSection';
import ProfileSection from '../components/trainer/ProfileSection';
import RoutinesSection from '../components/trainer/RoutinesSection';
import FormsSection from '../components/trainer/FormsSection';
import FilesSection from '../components/trainer/FilesSection';
import ProgramSection from '../components/client/ProgramSection';
import SubscriptionSection from '../components/client/SubscriptionSection';
import { auth } from '../firebase.config';

const { Sider, Content } = Layout;

const Dashboard = () => {
    const { role } = useContext(AuthContext);
    const [isChatVisible, setChatVisible] = useState(false);
    const [newMessages, setNewMessages] = useState(0);
    const [selectedSection, setSelectedSection] = useState('home');
    const router = useRouter();

    const toggleChat = () => setChatVisible(!isChatVisible);

    const handleLogout = () => {
        auth.signOut().then(() => {
            router.push('/login');
        }).catch(error => {
            console.error("Error during logout: ", error);
        });
    };

    const renderContent = () => {
        if (role === 'trainer') {
            switch (selectedSection) {
                case 'home': return <HomeSection />;
                case 'profile': return <ProfileSection />;
                case 'routines': return <RoutinesSection />;
                case 'forms': return <FormsSection />;
                case 'files': return <FilesSection />;
                default: return <HomeSection />;
            }
        } else {
            switch (selectedSection) {
                case 'program': return <ProgramSection />;
                case 'subscription': return <SubscriptionSection />;
                default: return <ProgramSection />;
            }
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <Sidebar onSelectSection={setSelectedSection} />
            </Sider>
            <Layout>
                <DashboardHeader onLogout={handleLogout} newMessages={newMessages} />
                <Content style={{ margin: '16px' }}>
                    {renderContent()}
                </Content>
                <FloatButton
                    icon={
                        <Badge count={newMessages} size="small">
                            <MessageOutlined />
                        </Badge>
                    }
                    style={{ right: 24, bottom: 24 }}
                    onClick={toggleChat}
                />
                <Modal
                    title="Chat"
                    visible={isChatVisible}
                    onCancel={toggleChat}
                    footer={null}
                    width={600}
                >
                    <Chat />
                </Modal>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
