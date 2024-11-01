// components/trainer/utils.js

import { Editor, Transforms, Text, Element as SlateElement } from 'slate';
import { initialValue } from './initialValue';
export const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

export const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = format === 'numbered-list' || format === 'bulleted-list';

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            ['numbered-list', 'bulleted-list'].includes(n.type),
        split: true,
    });

    let newType = isActive ? 'paragraph' : isList ? 'list-item' : format;
    Transforms.setNodes(editor, { type: newType });

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
};

export const serialize = (value) => {
    return JSON.stringify(value);
};

export const deserialize = (string) => {
    try {
        return string ? JSON.parse(string) : initialValue;
    } catch (error) {
        console.error('Error parsing JSON in deserialize:', error);
        return initialValue;
    }
};
