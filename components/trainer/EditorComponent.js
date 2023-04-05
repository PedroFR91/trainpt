import React, { useEffect, useRef } from 'react';

const EditorComponent = ({ data, onDataChange }) => {
  const editorRef = useRef(null);
  const isReady = useRef(false);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;

      editorRef.current = new EditorJS({
        holder: 'editor',
        data: data || {},
        tools: {
          header: Header,
          paragraph: Paragraph,
        },
        onChange: async () => {
          const newData = await editorRef.current.save();
          onDataChange(newData);
        },
      });
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return <div id='editor' />;
};

export default EditorComponent;
