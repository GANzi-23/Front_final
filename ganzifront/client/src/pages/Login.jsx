import React, { useEffect, useCallback, useState } from "react";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleCreateAccount = (e) => {
        e.preventDefault();
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Container>
            <LeftPanel>
                <IntroText>
                    Join the video conference <br /> using your own avatar
                </IntroText>
                <LogoImage src="/images/Ganzi1.png" alt="Logo" />
            </LeftPanel>
            <RightPanel>
                <TitleText>
                    GANZI Log in
                </TitleText>
                <FormContainer>
                    <form onSubmit={handleCreateAccount}>
                        <InputField type="email" placeholder="Email Adress" />
                        <InputField type="password" placeholder="Password" />
                        <CreateAccountButton type="submit">Log in</CreateAccountButton>
                        <LoginButton onClick={handleLoginClick}>비밀번호를 잊어버리셨나요? <MintText>비밀번호 찾기</MintText></LoginButton>
                    </form>
                </FormContainer>
            </RightPanel>
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #B1D9DB;
`;

const LeftPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
`;

const IntroText = styled.p`
    font-family: 'Poppins', sans-serif;
    font-size: 25px;
    font-weight: bold;
    color: #fff;
    text-align: center;
`;

const LogoImage = styled.img`
    width: 150px;
    height: 50px;
    border-radius: 0px;
`;

const RightPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    border-radius: 10px;
    padding: 20px;
    height: 100%;
`;

const TitleText = styled.div`
    font-family: 'Poppins', sans-serif;
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 20px;
`;

const FormContainer = styled.div`
    text-align: center;
    margin-top: 30px;
    width: 100%;
`;

const InputField = styled.input`
    font-family: 'Poppins', sans-serif;
    width: 80%;
    margin: 10px 0;
    padding: 15px;
    border: 2px solid #A0A0A0; /* 테두리 색상 변경 */
    border-radius: 20px;
`;

const CreateAccountButton = styled.button`
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    background-color: #7CD2D7;
    color: #fff;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 20px;
    width: 85%;
    margin-top: 25px;
`;

const LoginButton = styled.div`
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    color: #A0A0A0;
    margin-top: 20px;
    cursor: pointer;
`;

const MintText = styled.span`
    color: #7CD2D7; /* 민트색 */
    cursor: pointer;
`;

export default Login;
