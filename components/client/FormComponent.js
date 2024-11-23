import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Select, Upload, Steps, Divider, Space, message, Spin, Switch } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";
import { addSubcollectionDocument } from "../../services/firebase";

const { Option } = Select;
const { Step } = Steps;

// Componente auxiliar para campos dinámicos
const DynamicField = ({ field, index, section, updateField, removeField }) => {
    const handleTypeChange = (value) => {
        updateField(section, index, 'type', value);
    };

    const handleLabelChange = (e) => {
        updateField(section, index, 'label', e.target.value);
    };

    const handlePlaceholderChange = (e) => {
        updateField(section, index, 'placeholder', e.target.value);
    };

    const handleOptionChange = (optionIndex, e) => {
        const newOptions = [...field.options];
        newOptions[optionIndex] = e.target.value;
        updateField(section, index, 'options', newOptions);
    };

    const addOption = () => {
        const newOptions = field.options ? [...field.options, ''] : [''];
        updateField(section, index, 'options', newOptions);
    };

    const removeOption = (optionIndex) => {
        const newOptions = field.options.filter((_, i) => i !== optionIndex);
        updateField(section, index, 'options', newOptions);
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, backgroundColor: '#ffffff' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item label="Tipo de Campo">
                    <Select value={field.type} onChange={handleTypeChange} style={{ width: 200 }}>
                        <Option value="input">Input</Option>
                        <Option value="textarea">Textarea</Option>
                        <Option value="select">Select</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Nombre del Campo">
                    <Input value={field.label} onChange={handleLabelChange} placeholder="Nombre del campo" />
                </Form.Item>
                <Form.Item label="Placeholder">
                    <Input value={field.placeholder || ''} onChange={handlePlaceholderChange} placeholder="Placeholder del campo" />
                </Form.Item>
                {field.type === 'select' && (
                    <Form.Item label="Opciones">
                        {field.options && field.options.map((option, optIndex) => (
                            <Space key={optIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Input
                                    value={option}
                                    onChange={(e) => handleOptionChange(optIndex, e)}
                                    placeholder={`Opción ${optIndex + 1}`}
                                />
                                <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeOption(optIndex)}
                                    danger
                                />
                            </Space>
                        ))}
                        <Button type="dashed" onClick={addOption} block icon={<PlusOutlined />}>
                            Añadir Opción
                        </Button>
                    </Form.Item>
                )}
                <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeField(index)}>
                    Eliminar Campo
                </Button>
            </Space>
        </div>
    );
};

const FormComponent = ({ setShowForm, subscriptionId }) => {
    const { myUid } = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [formType, setFormType] = useState('initial'); // 'initial' or 'follow'
    const [rates, setRates] = useState([]);
    const [loadingRates, setLoadingRates] = useState(true);

    const [formStructure, setFormStructure] = useState({
        selectedTariff: null,
        name: '',
        gender: 'man',
        weight: '',
        height: '',
        front: null,
        back: null,
        lateral: null,
        dietFields: [],
        trainingFields: [],
        generalFields: [],
        measures: {
            chest: '',
            shoulders: '',
            biceps: '',
            hips: '',
            abdomen: '',
            cuadriceps: '',
            gemelos: ''
        },
        trainingFeedback: ''
    });

    const [form] = Form.useForm();

    useEffect(() => {
        if (formType === 'initial') {
            const fetchRates = async () => {
                try {
                    if (!myUid) return;
                    const ratesCollectionRef = collection(db, 'trainers', myUid, 'rates');
                    const querySnapshot = await getDocs(ratesCollectionRef);
                    const ratesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRates(ratesList);
                } catch (error) {
                    console.error('Error al obtener las tarifas:', error);
                } finally {
                    setLoadingRates(false);
                }
            };
            fetchRates();
        }
    }, [myUid, formType]);

    const uploadPhoto = async (file) => {
        const name = new Date().getTime() + file.name;
        const storageRef = ref(storage, name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        try {
            await uploadTask;
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error(`Error al subir ${file.name}:`, error);
            return null;
        }
    };

    const handleCreate = async () => {
        try {
            const frontUrl = formStructure.front ? await uploadPhoto(formStructure.front) : null;
            const backUrl = formStructure.back ? await uploadPhoto(formStructure.back) : null;
            const lateralUrl = formStructure.lateral ? await uploadPhoto(formStructure.lateral) : null;

            const cleanValues = {
                ...formStructure,
                front: frontUrl,
                back: backUrl,
                lateral: lateralUrl,
                type: formType,
                trainerId: myUid,
                timeStamp: serverTimestamp(),
            };

            await addSubcollectionDocument('trainers', myUid, 'forms', cleanValues);

            message.success("Formulario creado correctamente");
            form.resetFields();
            setFormStructure({
                selectedTariff: null,
                name: '',
                gender: 'man',
                weight: '',
                height: '',
                front: null,
                back: null,
                lateral: null,
                dietFields: [],
                trainingFields: [],
                generalFields: [],
                measures: {
                    chest: '',
                    shoulders: '',
                    biceps: '',
                    hips: '',
                    abdomen: '',
                    cuadriceps: '',
                    gemelos: ''
                },
                trainingFeedback: ''
            });
            setCurrentStep(0);
        } catch (error) {
            console.error("Error al crear el formulario:", error);
            message.error("Error al crear el formulario");
        }
    };

    const addField = (section, type = 'input') => {
        const newField = { type, label: '', placeholder: '', options: type === 'select' ? [''] : [] };
        setFormStructure(prev => ({
            ...prev,
            [section]: [...prev[section], newField]
        }));
    };

    const updateField = (section, index, key, value) => {
        const updatedFields = formStructure[section].map((field, idx) => {
            if (idx === index) {
                return { ...field, [key]: value };
            }
            return field;
        });
        setFormStructure(prev => ({
            ...prev,
            [section]: updatedFields
        }));
    };

    const removeField = (section, index) => {
        const updatedFields = formStructure[section].filter((_, idx) => idx !== index);
        setFormStructure(prev => ({
            ...prev,
            [section]: updatedFields
        }));
    };

    const steps = [
        {
            title: 'Datos Generales',
            content: (
                <>
                    {formType === 'initial' && loadingRates ? (
                        <Spin />
                    ) : (
                        <>
                            {formType === 'initial' && (
                                <Form.Item
                                    name="selectedRate"
                                    label="Selecciona una tarifa"
                                    rules={[{ required: true, message: 'Por favor selecciona una tarifa' }]}
                                >
                                    <Select
                                        placeholder="Selecciona una tarifa"
                                        onChange={(value) => setFormStructure({ ...formStructure, selectedRate: value })}
                                    >
                                        {rates.map(rate => (
                                            <Option key={rate.id} value={rate.id}>
                                                {rate.ratename} - {rate.periodicity}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                            <Form.Item
                                name="name"
                                label="Nombre"
                                rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                            >
                                <Input
                                    placeholder="Nombre del cliente"
                                    onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })}
                                />
                            </Form.Item>
                            <Form.Item
                                name="gender"
                                label="Sexo"
                                rules={[{ required: true, message: 'Por favor selecciona el sexo' }]}
                            >
                                <Select
                                    onChange={(value) => setFormStructure({ ...formStructure, gender: value })}
                                >
                                    <Option value="man">Hombre</Option>
                                    <Option value="woman">Mujer</Option>
                                    <Option value="other">Otro</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="weight"
                                label="Peso"
                                rules={[{ required: true, message: 'Por favor ingresa el peso' }]}
                            >
                                <Input
                                    placeholder="Peso en kg"
                                    onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })}
                                />
                            </Form.Item>
                            {formType === 'initial' && (
                                <Form.Item
                                    name="height"
                                    label="Altura"
                                    rules={[{ required: true, message: 'Por favor ingresa la altura' }]}
                                >
                                    <Input
                                        placeholder="Altura en cm"
                                        onChange={(e) => setFormStructure({ ...formStructure, height: e.target.value })}
                                    />
                                </Form.Item>
                            )}
                            <Divider>Preguntas adicionales</Divider>
                            {formStructure.generalFields.map((field, index) => (
                                <DynamicField
                                    key={index}
                                    field={field}
                                    index={index}
                                    section="generalFields"
                                    updateField={updateField}
                                    removeField={() => removeField('generalFields', index)}
                                />
                            ))}
                            <Button type="dashed" onClick={() => addField('generalFields')} block icon={<PlusOutlined />}>
                                Añadir Campo
                            </Button>
                        </>
                    )}
                </>
            ),
        },
        {
            title: 'Fotos',
            content: (
                <>
                    <Form.Item name="front" label="Frente">
                        <Upload
                            beforeUpload={(file) => {
                                setFormStructure(prev => ({ ...prev, front: file }));
                                return false; // Evita la subida automática
                            }}
                            listType="picture"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Subir imagen frontal</Button>
                        </Upload>
                        {formStructure.front && (
                            <img
                                src={URL.createObjectURL(formStructure.front)}
                                alt="Frente"
                                style={{ width: '100%', marginTop: 8 }}
                            />
                        )}
                    </Form.Item>
                    <Form.Item name="lateral" label="Lateral">
                        <Upload
                            beforeUpload={(file) => {
                                setFormStructure(prev => ({ ...prev, lateral: file }));
                                return false; // Evita la subida automática
                            }}
                            listType="picture"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Subir imagen lateral</Button>
                        </Upload>
                        {formStructure.lateral && (
                            <img
                                src={URL.createObjectURL(formStructure.lateral)}
                                alt="Lateral"
                                style={{ width: '100%', marginTop: 8 }}
                            />
                        )}
                    </Form.Item>
                    <Form.Item name="back" label="Espalda">
                        <Upload
                            beforeUpload={(file) => {
                                setFormStructure(prev => ({ ...prev, back: file }));
                                return false; // Evita la subida automática
                            }}
                            listType="picture"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Subir imagen trasera</Button>
                        </Upload>
                        {formStructure.back && (
                            <img
                                src={URL.createObjectURL(formStructure.back)}
                                alt="Espalda"
                                style={{ width: '100%', marginTop: 8 }}
                            />
                        )}
                    </Form.Item>
                </>
            ),
        },
        {
            title: 'Dieta',
            content: (
                <>
                    {formStructure.dietFields.map((field, index) => (
                        <DynamicField
                            key={index}
                            field={field}
                            index={index}
                            section="dietFields"
                            updateField={updateField}
                            removeField={() => removeField('dietFields', index)}
                        />
                    ))}
                    <Button type="dashed" onClick={() => addField('dietFields')} block icon={<PlusOutlined />}>
                        Añadir Campo
                    </Button>
                </>
            ),
        },
        {
            title: 'Entrenamiento',
            content: (
                <>
                    {formType === 'follow' && (
                        <Form.Item name="trainingFeedback" label="¿Cómo te ha ido el entrenamiento?">
                            <Input.TextArea
                                onChange={(e) => setFormStructure({ ...formStructure, trainingFeedback: e.target.value })}
                            />
                        </Form.Item>
                    )}
                    {formStructure.trainingFields.map((field, index) => (
                        <DynamicField
                            key={index}
                            field={field}
                            index={index}
                            section="trainingFields"
                            updateField={updateField}
                            removeField={() => removeField('trainingFields', index)}
                        />
                    ))}
                    <Button type="dashed" onClick={() => addField('trainingFields')} block icon={<PlusOutlined />}>
                        Añadir Campo
                    </Button>
                </>
            ),
        },
        {
            title: 'Medidas',
            content: (
                <>
                    {Object.keys(formStructure.measures).map((key) => (
                        <Form.Item
                            key={key}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            rules={[{ required: true, message: `Por favor ingresa tu medida de ${key}` }]}
                        >
                            <Input
                                placeholder={`Ingresa tu medida de ${key}`}
                                onChange={(e) => setFormStructure({
                                    ...formStructure,
                                    measures: { ...formStructure.measures, [key]: e.target.value }
                                })}
                            />
                        </Form.Item>
                    ))}
                </>
            ),
        },
    ];

    const next = () => setCurrentStep(prev => prev + 1);
    const prev = () => setCurrentStep(prev => prev - 1);

    return (
        <div>
            <Select defaultValue="initial" style={{ width: 200, marginBottom: 16 }} onChange={setFormType}>
                <Option value="initial">Formulario Inicial</Option>
                <Option value="follow">Formulario de Seguimiento</Option>
            </Select>
            <Form form={form} className={styles.initial} layout="vertical">
                <Steps current={currentStep}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div className="steps-content" style={{ marginTop: 24 }}>
                    {steps[currentStep].content}
                </div>
                <div className="steps-action" style={{ marginTop: 24 }}>
                    {currentStep > 0 && (
                        <Button style={{ marginRight: 8 }} onClick={() => prev()}>
                            Anterior
                        </Button>
                    )}
                    {currentStep < steps.length - 1 && (
                        <Button type="primary" onClick={() => next()}>
                            Siguiente
                        </Button>
                    )}
                    {currentStep === steps.length - 1 && (
                        <Button type="primary" onClick={handleCreate}>
                            Finalizar
                        </Button>
                    )}
                    <Button style={{ marginLeft: 8 }} onClick={() => setShowForm(false)}>
                        Cancelar
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default FormComponent;
