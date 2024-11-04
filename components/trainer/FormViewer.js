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
} from 'antd';
import { db, storage } from '../../firebase.config';
import styles from '../../styles/sharedform.module.css';
import { AiOutlineUpload } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import { getDoc, doc, updateDoc } from 'firebase/firestore';

const { TextArea } = Input;
const { Title } = Typography;

const FormViewer = ({ formId, clientId, onClose }) => {
    const { myUid } = useContext(AuthContext);

    const [formStructure, setFormStructure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const fetchFormStructure = async () => {
            try {
                const formDocRef = doc(db, 'forms', formId);
                const formSnapshot = await getDoc(formDocRef);
                if (formSnapshot.exists()) {
                    setFormStructure(formSnapshot.data());
                    // Verificar si el usuario es el cliente (tiene el mismo id que el clientId)
                    setIsClient(clientId === myUid);
                } else {
                    console.log('Formulario no encontrado');
                }
            } catch (error) {
                console.error('Error al obtener el formulario:', error);
            } finally {
                setLoading(false);
            }
        };

        if (formId) {
            fetchFormStructure();
        }
    }, [formId, clientId, myUid]);

    const handleUpdate = async () => {
        try {
            const formRef = doc(db, 'forms', formId);
            await updateDoc(formRef, { ...formStructure });
            console.log('Formulario actualizado');
            if (onClose) onClose(); // Cerrar el formulario después de guardar
        } catch (error) {
            console.error('Error al actualizar el formulario:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormStructure((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMeasuresChange = (e) => {
        const { name, value } = e.target;
        setFormStructure((prev) => ({
            ...prev,
            measures: {
                ...prev.measures,
                [name]: value,
            },
        }));
    };

    const uploadPhoto = async (fieldName, file) => {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        try {
            await uploadTask;
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            setFormStructure((prev) => ({
                ...prev,
                [fieldName]: downloadURL,
            }));
        } catch (error) {
            console.error(`Error al subir ${fieldName}:`, error);
        }
    };

    if (loading || !formStructure) {
        return <Spin size="large" className={styles.loadingSpinner} />;
    }

    const isInitial = formStructure.type === 'Inicial';

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
                        onFinish={isClient ? handleUpdate : null}
                    >
                        <Title level={3}>
                            {isClient
                                ? isInitial
                                    ? 'Formulario Inicial (Editable)'
                                    : 'Formulario de Seguimiento (Editable)'
                                : isInitial
                                    ? 'Formulario Inicial (Vista de Solo Lectura)'
                                    : 'Formulario de Seguimiento (Vista de Solo Lectura)'}
                        </Title>

                        {/* Sección de Datos Generales y Medidas en dos columnas */}
                        <Card type="inner" className={styles.sectionCard}>
                            <Row gutter={16}>
                                {/* Columna de Datos Generales */}
                                <Col xs={24} md={12}>
                                    <Title level={4}>Datos Generales</Title>
                                    <Form.Item label="Nombre">
                                        <Input
                                            name="name"
                                            value={formStructure.name || ''}
                                            onChange={handleChange}
                                            readOnly={!isClient}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Sexo">
                                        <Select
                                            name="gender"
                                            value={formStructure.gender || ''}
                                            onChange={(value) =>
                                                setFormStructure({ ...formStructure, gender: value })
                                            }
                                            disabled={!isClient}
                                        >
                                            <Select.Option value="man">Hombre</Select.Option>
                                            <Select.Option value="woman">Mujer</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    {isInitial && (
                                        <>
                                            <Form.Item label="Peso">
                                                <Input
                                                    name="weight"
                                                    value={formStructure.weight || ''}
                                                    onChange={handleChange}
                                                    readOnly={!isClient}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Altura">
                                                <Input
                                                    name="height"
                                                    value={formStructure.height || ''}
                                                    onChange={handleChange}
                                                    readOnly={!isClient}
                                                />
                                            </Form.Item>
                                        </>
                                    )}
                                    {!isInitial && (
                                        <Form.Item label="Peso actual">
                                            <Input
                                                name="currentWeight"
                                                value={formStructure.currentWeight || ''}
                                                onChange={handleChange}
                                                readOnly={!isClient}
                                            />
                                        </Form.Item>
                                    )}
                                </Col>

                                {/* Columna de Medidas */}
                                <Col xs={24} md={12}>
                                    <Title level={4}>Medidas</Title>
                                    <Row gutter={16}>
                                        {Object.keys(formStructure.measures || {}).map((key) => (
                                            <Col xs={24} sm={12} key={key}>
                                                <Form.Item
                                                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                                                >
                                                    <Input
                                                        name={key}
                                                        value={formStructure.measures[key] || ''}
                                                        onChange={handleMeasuresChange}
                                                        readOnly={!isClient}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        ))}
                                    </Row>
                                </Col>
                            </Row>
                        </Card>

                        {/* Sección de Dieta */}
                        <Card type="inner" title="Dieta" className={styles.sectionCard}>
                            <Form.Item label="Intolerancias">
                                <TextArea
                                    name="intolerances"
                                    value={formStructure.intolerances || ''}
                                    onChange={handleChange}
                                    readOnly={!isClient}
                                    rows={3}
                                />
                            </Form.Item>
                            <Form.Item label="Preferencias de comida">
                                <TextArea
                                    name="preferredFoods"
                                    value={formStructure.preferredFoods || ''}
                                    onChange={handleChange}
                                    readOnly={!isClient}
                                    rows={3}
                                />
                            </Form.Item>
                        </Card>

                        {/* Sección de Fotos con Carrusel */}
                        {photos.length > 0 && (
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

                        {/* Botón de Guardar para el Cliente */}
                        {isClient && (
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Guardar
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
