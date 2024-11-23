import React from 'react';
import { Calendar, theme } from 'antd';

const MiniCalendar = () => {
    const { token } = theme.useToken();
    const wrapperStyle = {
        width: '100%',
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };

    const onPanelChange = (value, mode) => {
        console.log(value.format('YYYY-MM-DD'), mode);
    };

    return (
        <div style={wrapperStyle}>
            <Calendar fullscreen={false} onPanelChange={onPanelChange} />
        </div>
    );
};

export default MiniCalendar;
