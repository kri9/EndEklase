import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await resetPassword(token, password);
        setMessage('Пароль успешно изменён!');
    };

    return (
        <div>
            <h2>Введите новый пароль</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="password" 
                    placeholder="Введите новый пароль" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit">Сохранить</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;
