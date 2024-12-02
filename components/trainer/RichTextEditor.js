import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Importar los estilos de Quill

// Carga dinámica de ReactQuill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const RichTextEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  return <ReactQuill value={value} onChange={onChange} modules={modules} />;
};

export default RichTextEditor;
