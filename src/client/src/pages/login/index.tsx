import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Store, RuleRender} from 'rc-field-form/lib/interface';
import {RouteComponentProps} from 'react-router';
import {Form, Input, Button} from 'antd';
import {Link} from 'react-router-dom';

import {ClientDataModel} from 'client/models/client-data';
import bevis from 'client/lib/bevis';
import {RoutePaths} from 'client/lib/routes';
import {UserRequestBookV1} from 'client/lib/request-book/v1/user';
import {ModalMessage} from 'client/components/modal-message';
import {FORM_VALIDATE_MESSAGES, FORM_ITEM_REQUIRED, FORM_EMAIL_REQUIRED} from 'client/consts';

import './index.scss';

interface Props extends RouteComponentProps {
    clientDataModel?: ClientDataModel;
}

const b = bevis('login-page');

const PASSWORD_VALIDATOR: RuleRender = ({getFieldValue}) => ({
	validator(_rule, value) {
		if (!value || getFieldValue('password') === value) {
			return Promise.resolve();
		}

		return Promise.reject(new Error('Пароли не совпадают'));
	}
});

const EMAIL_VALIDATOR: RuleRender = () => ({
	validator(_rule, value) {
		if (!value) {
			return Promise.resolve();
		}

		return UserRequestBookV1.checkEmail(value)
			.then((body) => {
				if (body.exist) {
					throw new Error('Такой email уже существует');
				}
			});
	}
});

@inject('clientDataModel')
@observer
export class LoginPage extends React.Component<Props> {
    private onLoginByAuthToken = (authToken: string) => this.props.clientDataModel?.loginByAuthToken(authToken)
            .then(() => this.props.history.replace(RoutePaths.MAIN))
            .catch((error) => ModalMessage.showError(error.response.data.message))

    private onFinishLoginHandler = (values: Store) => UserRequestBookV1.logInByCredentials({
    	email: values.email,
    	password: values.password
    })
    	.then(() => this.props.history.replace(RoutePaths.MAIN))
    	.then(() => this.props.clientDataModel?.initClientDataModel())
    	.catch((error) => ModalMessage.showError(error.response.data.message))

    private onFinishSignupHandler = (values: Store) => UserRequestBookV1.signUpByEmail({
    	email: values.email,
    	name: values.name,
    	password: values.password
    })
    	.then(() => {
    		ModalMessage.showSuccess({
    			title: 'Успешно',
    			content: `Вам на почту ${values.email} отправлено письмо с подтверждением`,
    			onOk: () => this.props.history.replace(RoutePaths.MAIN)
    		});
    	})
    	.catch((error) => ModalMessage.showError(error.response.data.message))

    private onFinishResetPasswordHandler = (values: Store) => {
    	const authToken = this.getAuthTokenFromQuery();
    	if (!authToken) {
    		ModalMessage.showError('Вы не можете сменить пароль, возможно, переход был по неправильной ссылке');
    		return;
    	}

    	return UserRequestBookV1.resetPassword({
    		authToken,
    		newPassword: values.password
    	})
    		.then(() => this.props.history.replace(RoutePaths.MAIN))
    		.then(() => this.props.clientDataModel?.initClientDataModel())
    		.catch((error) => ModalMessage.showError(error.response.data.message));
    }

    private onFinishForgotPasswordHandler = (values: Store) => UserRequestBookV1.forgotPassword(values.email)
    	.then(() => {
    		ModalMessage.showSuccess({
    			title: 'Успешно',
    			content: `Вам на почту ${values.email} отправлено письмо с подтверждением`
    		});
    	})
    	.catch((error) => ModalMessage.showError(error.response.data.message))

    private getAuthTokenFromQuery() {
    	const {location} = this.props;

    	const query = new URLSearchParams(location.search);
    	return query.get('auth_token');
    }

    private renderResetPassword(): React.ReactNode {
    	return (
    		<Form
    			layout='vertical'
    			onFinish={this.onFinishResetPasswordHandler}
    			validateMessages={FORM_VALIDATE_MESSAGES}
    		>
    			<Form.Item
    				name='password'
    				label='Новый пароль'
    				hasFeedback
    				rules={[
    					FORM_ITEM_REQUIRED
    				]}
    			>
    				<Input.Password />
    			</Form.Item>
    			<Form.Item
    				name='confirm'
    				label='Подтверждение пароля'
    				hasFeedback
    				dependencies={['password']}
    				rules={[
    					FORM_ITEM_REQUIRED,
    					PASSWORD_VALIDATOR
    				]}
    			>
    				<Input.Password />
    			</Form.Item>
    			<Form.Item>
    				<Button type='primary' htmlType='submit'>
                        Сохранить новый пароль
    				</Button>
    			</Form.Item>
    		</Form>
    	);
    }

    private renderForgotPassword(): React.ReactNode {
    	return (
    		<Form
    			layout='vertical'
    			onFinish={this.onFinishForgotPasswordHandler}
    			validateMessages={FORM_VALIDATE_MESSAGES}
    		>
    			<Form.Item
    				name='email'
    				label='e-mail'
    				hasFeedback
    				rules={[
    					FORM_EMAIL_REQUIRED
    				]}
    			>
    				<Input />
    			</Form.Item>
    			<Form.Item>
    				<Button type='primary' htmlType='submit'>
                        Сбросить пароль
    				</Button>
    			</Form.Item>
    		</Form>
    	);
    }

    private renderLogin(): React.ReactNode {
    	return (
    		<Form
    			layout='vertical'
    			onFinish={this.onFinishLoginHandler}
    			validateMessages={FORM_VALIDATE_MESSAGES}
    		>
    			<Form.Item
    				name='email'
    				label='e-mail'
    				hasFeedback
    				rules={[
    					FORM_EMAIL_REQUIRED
    				]}
    			>
    				<Input />
    			</Form.Item>
    			<Form.Item
    				name='password'
    				label='Пароль'
    				hasFeedback
    				rules={[
    					FORM_ITEM_REQUIRED
    				]}
    			>
    				<Input.Password />
    			</Form.Item>
    			<Form.Item>
    				<Button type='primary' htmlType='submit'>
                        Войти
    				</Button>
    			</Form.Item>
    			<Link to={RoutePaths.FORGOT_PASSWORD}>Забыли пароль</Link>
    		</Form>
    	);
    }

    private renderSignup(): React.ReactNode {
    	return (
    		<Form
    			layout='vertical'
    			onFinish={this.onFinishSignupHandler}
    			validateMessages={FORM_VALIDATE_MESSAGES}
    		>
    			<Form.Item
    				name='name'
    				label='Ваше имя'
    				hasFeedback
    				rules={[
    					FORM_ITEM_REQUIRED
    				]}
    			>
    				<Input />
    			</Form.Item>
    			<Form.Item
    				name='email'
    				label='e-mail'
    				hasFeedback
    				rules={[
    					FORM_EMAIL_REQUIRED,
    					EMAIL_VALIDATOR
    				]}
    			>
    				<Input />
    			</Form.Item>
    			<Form.Item
    				name='password'
    				label='Пароль'
    				hasFeedback
    				rules={[
    					FORM_ITEM_REQUIRED
    				]}
    			>
    				<Input.Password />
    			</Form.Item>
    			<Form.Item
    				name='confirm'
    				label='Подтверждение пароля'
    				hasFeedback
    				dependencies={['password']}
    				rules={[
    					FORM_ITEM_REQUIRED,
    					PASSWORD_VALIDATOR
    				]}
    			>
    				<Input.Password />
    			</Form.Item>
    			<Form.Item>
    				<Button type='primary' htmlType='submit'>
                        Зарегистрироваться
    				</Button>
    			</Form.Item>
    		</Form>
    	);
    }

    public render(): React.ReactNode {
    	const {location} = this.props;
    	const authToken = this.getAuthTokenFromQuery();

    	if (authToken && location.pathname === RoutePaths.LOGIN) {
    		this.onLoginByAuthToken(authToken);
    	}

    	return (
    		<div className={b()}>
    			<div className={b('container')}>
    				{
    					location.pathname === RoutePaths.SIGNUP ? this.renderSignup()
    						: location.pathname === RoutePaths.FORGOT_PASSWORD ? this.renderForgotPassword()
    							: location.pathname === RoutePaths.RESET_PASSWORD ? this.renderResetPassword()
    								: this.renderLogin()
    				}
    			</div>
    		</div>
    	);
    }
}
