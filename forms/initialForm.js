export const initialForm = {
  name: '',
  gender: '',
  weight: '',
  height: '',
  measures: {
    chest: '',
    shoulders: '',
    biceps: '',
    hips: '',
    abdomen: '',
    cuadriceps: '',
    gemelos: '',
  },
  lateral: '',
  front: '',
  back: '',
  intolerances: '',
  preferredFoods: '',
  trainingDays: {
    type: 'select',
    label: 'Días de entrenamiento:',
    options: Array.from({ length: 7 }, (_, index) => ({
      value: (index + 1).toString(),
      label: index + 1,
    })),
    value: '', // Valor inicial del select
  },
};
export const follow = {
  trainingDays: {
    options: [
      { label: 'Lunes', value: 'monday' },
      { label: 'Martes', value: 'tuesday' },
      { label: 'Miércoles', value: 'wednesday' },
      { label: 'Jueves', value: 'thursday' },
      { label: 'Viernes', value: 'friday' },
      { label: 'Sábado', value: 'saturday' },
      { label: 'Domingo', value: 'sunday' }
    ]
  },
  measures: {
    chest: '',
    shoulders: '',
    biceps: '',
    hips: '',
    abdomen: '',
    cuadriceps: '',
    gemelos: ''
  },
  lateral: '',
  front: '',
  back: '',
};
