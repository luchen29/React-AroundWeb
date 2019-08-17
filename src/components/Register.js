import React from 'react';
import { Form, Input, Tooltip, Icon, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { API_ROOT } from '../constants';

class RegistrationForm extends React.Component {
    state = {
      confirmDirty: false,
      autoCompleteResult: [],
    };

    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
          fetch(`${API_ROOT}/signup`, 
          {
            method:'POST',
            body:JSON.stringify({
              username: values.username,
              password: values.password,
            })
          })
          .then((response) => {
            if (response.ok) {
              return response.text();
            } 
            throw new Error(response.statusText);
          })
          .then( (data) => {
            console.log(data);
            this.props.history.push('/login');
            message.success('Registration Succeed!');
          })
          .catch((err) => {
            console.log(err);
            message.error('Registration Failed!');
          })
        }
      });
    };

    handleConfirmBlur = e => {
      const { value } = e.target;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
      const { form } = this.props;
      if (value && value !== form.getFieldValue('password')) {
        callback('Two passwords that you enter is inconsistent!');
      } else {
        callback();
      }
    };

    validateToNextPassword = (rule, value, callback) => {
      const { form } = this.props;
      if (value && this.state.confirmDirty) {
        form.validateFields(['confirm'], { force: true });
      }
      callback();
    };
  
    render() {
      const { getFieldDecorator } = this.props.form;
  
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },},
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },},
      };

      const tailFormItemLayout = {
        wrapperCol: {
          xs: {
            span: 24,
            offset: 0, },
          sm: {
            span: 16,
            offset: 8,},},
      };
     
      return (
        <Form {...formItemLayout} onSubmit={this.handleSubmit} className="register">
            <Form.Item label = {
              <span> Username&nbsp;
                      <Tooltip title="What do you want others to call you?">
                      <Icon type="question-circle-o" />
                      </Tooltip>
              </span> }>
              { getFieldDecorator (
                  'username', 
                  { rules: [
                      { required: true, message: 'Please input your username!'}],
                  })(<Input />)}
            </Form.Item>

            <Form.Item label="Password" hasFeedback>
                { getFieldDecorator (
                    'password', 
                    { rules: [
                        { required: true, message: 'Please input your password!'},
                        { validator: this.validateToNextPassword },],
                    })(<Input.Password />)}
            </Form.Item>

            <Form.Item label="Confirm Password" hasFeedback>
                { getFieldDecorator (
                    'confirm', 
                    { rules: [
                        { required: true, message: 'Please confirm your password!',},
                        { validator: this.compareToFirstPassword,},],
                    })(<Input.Password onBlur={this.handleConfirmBlur} />)}
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
                <p>I already have an account, go back to <Link to="/login">login</Link></p>
            </Form.Item>
        </Form>
      );
    }
}

// HighOrderComponent is a function. 
// Take in Component, return enhanced (UI+Config) Component.
export const Register = Form.create({ name: 'register' })(RegistrationForm);
