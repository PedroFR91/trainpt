import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // importa los estilos de Quill

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
