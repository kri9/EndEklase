import React, { useState } from 'react';
import { requestPasswordReset } from '../api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestPasswordReset(email);
        setMessage('Если email существует, на него отправлена ссылка для восстановления.');
    };

    return (
        <div>
            <h2>Восстановление пароля</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Введите ваш email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <button type="submit">Отправить</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword;
