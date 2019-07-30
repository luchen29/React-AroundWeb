import React from 'react';
import { Form, Input, Tooltip, Icon } from 'antd';

  
  class RegistrationForm extends React.Component {
    state = {
      confirmDirty: false,
      autoCompleteResult: [],
    };
  
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
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
  
    handleWebsiteChange = value => {
      let autoCompleteResult;
      if (!value) {
        autoCompleteResult = [];
      } else {
        autoCompleteResult = ['.com', '.org', '.net'].map(domain => `${value}${domain}`);
      }
      this.setState({ autoCompleteResult });
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
     
      return (
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
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
        </Form>
      );
    }
  }

// HighOrderComponent is a function. 
// Take in Component, return enhanced (UI+Config) Component.
export const Register = Form.create({ name: 'register' })(RegistrationForm);
