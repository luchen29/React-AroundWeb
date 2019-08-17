import React from 'react';
import { Modal, Button, message, Divider } from 'antd';
import { CreatePostForm } from './CreatePostForm';
import { TOKEN_KEY, POS_KEY, API_ROOT, AUTH_HEADER } from '../constants';

export class CreatePostButton extends React.Component {
    state = {
        visible: false,
        confirmLoading: false,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    }

    handleOk = () => {
        this.form.validateFields((err, values) => {
            console.log(values);
            if (!err) {
                const token = localStorage.getItem(TOKEN_KEY);
                const { lat, lon } = JSON.parse(localStorage.getItem(POS_KEY));
                const formData = new FormData();
                formData.set('lat', lat);
                formData.set('lon', lon);
                formData.set('message', values.message);
                formData.set('image', values.image[0].originFileObj);
                
                this.setState({confirmLoading: true});
                fetch(`${API_ROOT}/post`, {
                    method: 'POST',
                    headers: {
                        Authorization: `${AUTH_HEADER} ${token}`
                    },
                    body: formData,
                })
                .then((response) => {
                    if(response.ok) {
                        console.log(this.props);
                        return this.props.loadNearbyPosts();
                    } throw new Error('Failed to create post.')
                })
                .then(()=>{
                    this.setState({visible: false, confirmLoading: false});
                    this.form.resetFields();
                    message.success('Post create successfully!');
                })
                .catch((e)=>{
                    console.log(e);
                    message.error('Failed to create post.');
                    this.setState({confirmLoading: false});
                });
            }
        });
    }

    handleCancel = () => {
        console.log("Clicked cancel button");
        this.setState({
            visible: false,
        });
    }

    getFormRef = (formInstance) => {
        this.form = formInstance;
    }

    render() {
        const { visible, confirmLoading } = this.state;
        return(
            <div>
                <Button type="primary" onClick={this.showModal}> 
                    Create New Post
                </Button>
                <Modal 
                    title="Create New Post"
                    visible={visible}
                    onOk={this.handleOk}
                    okText="Create"
                    confirmLoading={confirmLoading}
                    onCancel={this.handleCancel} > 
                    <CreatePostForm ref={this.getFormRef}/>
                </Modal>
            </div>
        )
    }
} 