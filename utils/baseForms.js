// utils/baseForms.js

const baseForms = [
    {
        id: 'base-initial',
        name: 'Formulario Inicial',
        type: 'initial',
        isBase: true,
        generalFields: [],
        dietFields: [],
        trainingFields: [],
        measures: {
            chest: '',
            shoulders: '',
            biceps: '',
            hips: '',
            abdomen: '',
            cuadriceps: '',
            gemelos: ''
        },

    },
    {
        id: 'base-follow',
        name: 'Formulario de Seguimiento',
        type: 'follow',
        isBase: true,
        generalFields: [],
        dietFields: [],
        trainingFields: [],
        measures: {
            chest: '',
            shoulders: '',
            biceps: '',
            hips: '',
            abdomen: '',
            cuadriceps: '',
            gemelos: ''
        },

    },
];

export default baseForms;
