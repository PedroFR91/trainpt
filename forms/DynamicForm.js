import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';

const DynamicForm = ({ tExercise, setTExercise }) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Received values of form:', values);
        setTExercise({ ...tExercise, superset: values.exercises });
    };

    return (
        <Form
            form={form}
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            style={{
                maxWidth: 600,
            }}
            autoComplete="off"
        >
            <Form.List name="exercises">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space
                                key={key}
                                style={{
                                    display: 'flex',
                                    marginBottom: 8,
                                }}
                                align="baseline"
                            >
                                <Form.Item
                                    {...restField}
                                    name={[name, 'repetitions']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input the number of repetitions',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Repeticiones" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'sets']}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input the number of sets',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Series" />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} />
                            </Space>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Añadir Serie
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Guardar
                </Button>
            </Form.Item>
        </Form>
    );
};

export default DynamicForm;
