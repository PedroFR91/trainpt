// components/trainer/Toolbar.js

import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Button, Tooltip } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    CodeOutlined,
    StrikethroughOutlined,
    BlockOutlined,
} from '@ant-design/icons';
import { toggleMark, toggleBlock } from './utils';

const Toolbar = () => {
    const editor = useSlate();

    return (
        <div style={{ borderBottom: '1px solid #ddd', marginBottom: '10px' }}>
            <Button
                icon={<BoldOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'bold');
                }}
            />
            <Button
                icon={<ItalicOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'italic');
                }}
            />
            <Button
                icon={<UnderlineOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'underline');
                }}
            />
            <Button
                icon={<StrikethroughOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'strikethrough');
                }}
            />
            <Button
                icon={<BlockOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'heading-one');
                }}
            />
            <Button
                icon={<UnorderedListOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
                }}
            />
            <Button
                icon={<OrderedListOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
            />
            <Button
                icon={<CodeOutlined />}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'code');
                }}
            />
        </div>
    );
};

export default Toolbar;
