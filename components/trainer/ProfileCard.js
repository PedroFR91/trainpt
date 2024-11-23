// components/trainer/ProfileCard.js
import React from 'react';
import { Card, Avatar, Button, List, Upload } from 'antd';
import {
    LikeOutlined,
    StarOutlined,
    MessageOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import styles from '../../styles/myprofile.module.css';

const ProfileCard = ({
    profileData,
    likesCount,
    averageRating,
    comments,
    showEditButton,
    showCopyButton,
    onEdit,
    onCopy,
    onUploadProfilePicture,
    onUploadBackground,
    editable,
}) => {
    return (
        <Card title="Perfil" bordered={false} className={styles.profileCard} hoverable>
            <div
                className={styles.coverContainer}
                style={{ backgroundImage: `url(${profileData.background || '/default-background.jpg'})` }}
            >
                {editable && (
                    <Upload
                        showUploadList={false}
                        beforeUpload={onUploadBackground}
                    >
                        <Button
                            className={styles.coverUploadButton}
                            icon={<CopyOutlined />}
                            shape="circle"
                        />
                    </Upload>
                )}
            </div>
            <div className={styles.contentContainer}>
                <Avatar size={100} src={profileData.img || '/face.jpg'} />
                <h2 className={styles.username}>{profileData.username}</h2>

                {editable && (
                    <Upload
                        showUploadList={false}
                        beforeUpload={onUploadProfilePicture}
                    >
                        <Button>Subir Foto</Button>
                    </Upload>
                )}

                {showEditButton && (
                    <Button onClick={onEdit} style={{ marginBottom: 10 }}>
                        Editar Información
                    </Button>
                )}

                <div className={styles.socialStats}>
                    <div>
                        <LikeOutlined /> {likesCount} Me gusta
                    </div>
                    <div>
                        <StarOutlined /> {averageRating} Valoración promedio
                    </div>
                </div>

                <div className={styles.commentsSection}>
                    <h3>Comentarios</h3>
                    {comments.length > 0 ? (
                        <List
                            dataSource={comments}
                            renderItem={(item, index) => (
                                <List.Item key={index}>
                                    <MessageOutlined /> {item.comment}
                                </List.Item>
                            )}
                        />
                    ) : (
                        <p>No hay comentarios aún.</p>
                    )}
                </div>

                {showCopyButton && (
                    <Button
                        icon={<CopyOutlined />}
                        onClick={onCopy}
                        style={{ marginTop: 10 }}
                    >
                        Copiar URL del Perfil
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default ProfileCard;
