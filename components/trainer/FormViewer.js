// components/trainer/FormViewer.js

import { useState, useEffect, useContext } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    Upload,
    Spin,
    Space,
    Card,
    Typography,
    Row,
    Col,
    Carousel,
    message,
} from 'antd';
import { db, storage } from '../../firebase.config';
import styles from '../../styles/sharedform.module.css';
import { AiOutlineUpload } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const { TextArea } = Input;
const { Title } = Typography;

const FormViewer = ({ trainerId, formId, clientId, assignedFormId, onClose }) => {
    const { myUid, role } = useContext(AuthContext);

    const [formStructure, setFormStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchFormStructure = async () => {
            try {
                // Obtener el formulario desde la subcolección correcta
                const formDocRef = doc(db, 'trainers', trainerId, 'forms', formId);
                const formSnapshot = await getDoc(formDocRef);
                if (formSnapshot.exists()) {
                    setFormStructure(formSnapshot.data());
                    setIsClient(role === 'client' && clientId === myUid);
                } else {
                    console.log('Formulario no encontrado');
                }
            } catch (error) {
                console.error('Error al obtener el formulario:', error);
            } finally {
                setLoading(false);
            }
        };

        if (formId && trainerId) {
            fetchFormStructure();
        }
    }, [formId, trainerId, myUid, role, clientId]);

    const handleFinish = async (values) => {
        if (isClient) {
            try {
                // Subir fotos solo si son nuevas
                const uploadPhoto = async (file) => {
                    if (!file) return null; // Validar que el archivo no sea nulo
                    const name = new Date().getTime() + file.name;
                    const storageRef = ref(storage, name);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    await uploadTask;
                    return await getDownloadURL(uploadTask.snapshot.ref);
                };

                const frontUrl =
                    values.front && values.front.fileList && values.front.fileList[0]?.originFileObj
                        ? await uploadPhoto(values.front.fileList[0].originFileObj)
                        : formStructure.front;

                const backUrl =
                    values.back && values.back.fileList && values.back.fileList[0]?.originFileObj
                        ? await uploadPhoto(values.back.fileList[0].originFileObj)
                        : formStructure.back;

                const lateralUrl =
                    values.lateral && values.lateral.fileList && values.lateral.fileList[0]?.originFileObj
                        ? await uploadPhoto(values.lateral.fileList[0].originFileObj)
                        : formStructure.lateral;

                // Actualizar el formulario asignado en la colección de formularios asignados
                const assignedFormRef = doc(db, 'clients', myUid, 'assignedForms', assignedFormId);
                await updateDoc(assignedFormRef, {
                    responses: {
                        ...values,
                        front: frontUrl,
                        back: backUrl,
                        lateral: lateralUrl,
                    },
                    status: 'completed',
                    completedAt: serverTimestamp(),
                });

                message.success('Formulario enviado correctamente');
                if (onClose) onClose();
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                message.error('Error al enviar el formulario');
            }
        }
    };


    if (loading || !formStructure) {
        return <Spin size="large" className={styles.loadingSpinner} />;
    }

    // Preparar las fotos para el carrusel
    const photos = [
        { src: formStructure.front, alt: 'Frente' },
        { src: formStructure.back, alt: 'Espalda' },
        { src: formStructure.lateral, alt: 'Lateral' },
    ].filter((photo) => photo.src);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Card className={styles.formCard}>
                    <Form
                        layout="vertical"
                        className={styles.form}
                        form={form}
                        onFinish={handleFinish}
                    >
                        <Title level={3}>
                            {formStructure.name}
                        </Title>

                        {/* Sección de Datos Generales y Medidas en dos columnas */}
                        <Card type="inner" className={styles.sectionCard}>
                            <Row gutter={16}>
                                {/* Columna de Datos Generales */}
                                <Col xs={24} md={12}>
                                    <Title level={4}>Datos Generales</Title>
                                    <Form.Item label="Nombre" name="name" initialValue={formStructure.name}>
                                        <Input disabled={!isClient} />
                                    </Form.Item>
                                    <Form.Item label="Sexo" name="gender" initialValue={formStructure.gender}>
                                        <Select disabled={!isClient}>
                                            <Select.Option value="man">Hombre</Select.Option>
                                            <Select.Option value="woman">Mujer</Select.Option>
                                            <Select.Option value="other">Otro</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Peso" name="weight" initialValue={formStructure.weight}>
                                        <Input disabled={!isClient} />
                                    </Form.Item>
                                    {formStructure.type === 'initial' && (
                                        <Form.Item label="Altura" name="height" initialValue={formStructure.height}>
                                            <Input disabled={!isClient} />
                                        </Form.Item>
                                    )}
                                    {formStructure.generalFields && formStructure.generalFields.map((field, index) => (
                                        <Form.Item
                                            key={index}
                                            label={field.label}
                                            name={`general_${index}`}
                                        >
                                            {field.type === 'input' && <Input disabled={!isClient} />}
                                            {field.type === 'textarea' && <TextArea disabled={!isClient} />}
                                            {field.type === 'select' && (
                                                <Select disabled={!isClient}>
                                                    {field.options.map((option, idx) => (
                                                        <Select.Option key={idx} value={option}>
                                                            {option}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    ))}
                                </Col>

                                {/* Columna de Medidas */}
                                <Col xs={24} md={12}>
                                    <Title level={4}>Medidas</Title>
                                    {formStructure.measures && Object.keys(formStructure.measures).map((key) => (
                                        <Form.Item
                                            key={key}
                                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                                            name={`measure_${key}`}
                                            initialValue={formStructure.measures[key]}
                                        >
                                            <Input disabled={!isClient} />
                                        </Form.Item>
                                    ))}
                                </Col>
                            </Row>
                        </Card>

                        {/* Sección de Dieta */}
                        {formStructure.dietFields && formStructure.dietFields.length > 0 && (
                            <Card type="inner" title="Dieta" className={styles.sectionCard}>
                                {formStructure.dietFields.map((field, index) => (
                                    <Form.Item
                                        key={index}
                                        label={field.label}
                                        name={`diet_${index}`}
                                    >
                                        {field.type === 'input' && <Input disabled={!isClient} />}
                                        {field.type === 'textarea' && <TextArea disabled={!isClient} />}
                                        {field.type === 'select' && (
                                            <Select disabled={!isClient}>
                                                {field.options.map((option, idx) => (
                                                    <Select.Option key={idx} value={option}>
                                                        {option}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                ))}
                            </Card>
                        )}

                        {/* Sección de Entrenamiento */}
                        {formStructure.trainingFields && formStructure.trainingFields.length > 0 && (
                            <Card type="inner" title="Entrenamiento" className={styles.sectionCard}>
                                {formStructure.trainingFields.map((field, index) => (
                                    <Form.Item
                                        key={index}
                                        label={field.label}
                                        name={`training_${index}`}
                                    >
                                        {field.type === 'input' && <Input disabled={!isClient} />}
                                        {field.type === 'textarea' && <TextArea disabled={!isClient} />}
                                        {field.type === 'select' && (
                                            <Select disabled={!isClient}>
                                                {field.options.map((option, idx) => (
                                                    <Select.Option key={idx} value={option}>
                                                        {option}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item>
                                ))}
                            </Card>
                        )}

                        {/* Sección de Fotos */}
                        {isClient && (
                            <Card type="inner" title="Fotos" className={styles.sectionCard}>
                                <Form.Item label="Frente" name="front">
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        defaultFileList={
                                            formStructure.front ? [{
                                                uid: '-1',
                                                name: 'front.png',
                                                status: 'done',
                                                url: formStructure.front,
                                            }] : []
                                        }
                                    >
                                        {formStructure.front ? null : (
                                            <div>
                                                <AiOutlineUpload />
                                                <div style={{ marginTop: 8 }}>Subir</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                                <Form.Item label="Espalda" name="back">
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        defaultFileList={
                                            formStructure.back ? [{
                                                uid: '-1',
                                                name: 'back.png',
                                                status: 'done',
                                                url: formStructure.back,
                                            }] : []
                                        }
                                    >
                                        {formStructure.back ? null : (
                                            <div>
                                                <AiOutlineUpload />
                                                <div style={{ marginTop: 8 }}>Subir</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                                <Form.Item label="Lateral" name="lateral">
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        defaultFileList={
                                            formStructure.lateral ? [{
                                                uid: '-1',
                                                name: 'lateral.png',
                                                status: 'done',
                                                url: formStructure.lateral,
                                            }] : []
                                        }
                                    >
                                        {formStructure.lateral ? null : (
                                            <div>
                                                <AiOutlineUpload />
                                                <div style={{ marginTop: 8 }}>Subir</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Card>
                        )}

                        {/* Mostrar fotos en carrusel si no es cliente */}
                        {!isClient && photos.length > 0 && (
                            <Card type="inner" title="Fotos" className={styles.sectionCard}>
                                <Carousel dots={true}>
                                    {photos.map((photo, index) => (
                                        <div key={index} className={styles.carouselItem}>
                                            <img
                                                src={photo.src}
                                                alt={photo.alt}
                                                className={styles.carouselImage}
                                            />
                                            <p className={styles.carouselCaption}>{photo.alt}</p>
                                        </div>
                                    ))}
                                </Carousel>
                            </Card>
                        )}

                        {/* Botón de Enviar para el Cliente */}
                        {isClient && (
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Enviar
                                </Button>
                            </Form.Item>
                        )}
                    </Form>
                </Card>
                {onClose && (
                    <Button className={styles.closeButton} onClick={onClose}>
                        Cerrar
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FormViewer;
