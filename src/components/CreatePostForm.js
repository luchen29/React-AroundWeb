import React from 'react';
import { Form, Input, Upload, Icon } from 'antd';

class NormalCreatePostForm extends React.Component{
    normFile = e => {
        console.log('upload event: ', e);
        if (Array.isArray(e)) {
            return e;
        } else {
            return e && e.fileList;
        }
    }

    beforUpload = () => false;

    render () {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        return (
            <Form {...formItemLayout}>
                <Form.Item label="Message">
                    { getFieldDecorator( 'message', 
                        { rules: [{required: true, message: "Please imput a post message."}] })
                        (<Input />)}
                </Form.Item>
                <Form.Item label="Image/Video">
                    <div className="dropbox" >
                        { getFieldDecorator( 'image', 
                            {   valuePropName: 'fileList',
                                getValueFromEvent: this.normFile,
                                rules: [{ required: true, message: "Please select an image."}]
                            })
                            (   <Upload.Dragger name="files" beforeUpload={this.beforUpload}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="inbox" />
                                    </p>
                                    <p className="ant-upload-text">
                                        Click or drag file to this area to upload
                                    </p>
                                    <p className="ant-upload-hint">
                                        Support for a single or bulk upload
                                    </p>
                                </Upload.Dragger>
                            )
                        }
                    </div>
                </Form.Item>
            </Form>
        )
    }
}

export const CreatePostForm = Form.create()(NormalCreatePostForm);