import React from 'react';
import { Tabs, Spin, Row, Col, Radio } from 'antd';
import { API_ROOT, TOKEN_KEY, GEO_OPTIONS, POS_KEY, AUTH_HEADER, 
        POST_TYPE_IMAGE, POST_TYPE_VIDEO, POST_TYPE_UNKNOWN, 
        TOPIC_AROUND, TOPIC_FACE} from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';
import { AroundMap } from './AroundMap';

const { TabPane } = Tabs;

export class Home extends React.Component{
    state = {
        isLoadingGeoLocation: false,
        isLoadingPosts: false,
        topic: TOPIC_AROUND,
        posts: [],
        error: '',
    }

    componentDidMount() {
        if ("geolocation" in navigator) {
            this.setState(
                {   isLoadingGeoLocation: true,
                    error: ''
                });
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS);  
        } else {
            this.setState({
                error: 'Geolocation is not supported.'
            })
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({
            lat: latitude,
            lon: longitude
        }));
        this.setState({
            isLoadingGeoLocation: false,   
            error: '',
        });
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load geolocation.'
        });
    }

    loadNearbyPosts = (center, radius) => {
        const token = localStorage.getItem(TOKEN_KEY);
        const { lat, lon } = center ? center : JSON.parse( localStorage.getItem(POS_KEY));
        const range = radius ? radius : 20;        
        this.setState({
            isLoadingPosts: true,
            error: ''
        });
        return fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`, 
            {   method: 'GET',
                headers: { Authorization: `${AUTH_HEADER} ${token}` },
            })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts');
        })
        .then((data)=>{
            // console.log(data);
            this.setState({
                isLoadingPosts: false,
                posts: data ? data : []
            });
        })
        .catch((e) => {
            console.error(e);
            this.setState({
                isLoadingPosts: false,
                error: e.message
            });
        });
    }

    loadFacesAroundTheWorld = () => {
        const token =localStorage.getItem(TOKEN_KEY);
        this.setState( 
            {isLoadingPosts: true, error:''}
        );
        return fetch(`${API_ROOT}/cluster?term=face`, 
            {   method: 'GET',
                headers: {Authorization: `${AUTH_HEADER} ${token}`,}
            })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts');
        })
        .then((data) => {
            console.log(data);
            this.setState(
                {   isLoadingPosts: false,
                    posts: data ? data : [],
                })
        })
        .catch((e) => {
            console.error(e);
            this.setState(
                {   isLoadingPosts: false,
                    error: e.message
                })
        });
    }

    renderImagePosts() {
        const { posts } = this.state;
        const images = posts
            .filter((post) => post.type === POST_TYPE_IMAGE)
            .map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    caption: post.message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                }
            })
        return <Gallery images={images}/>
    }

    renderVideoPosts() {
        const { posts } = this.state;
        return (
            <Row gutter={30}>
                { posts
                    .filter((post) => [POST_TYPE_VIDEO, POST_TYPE_UNKNOWN].includes(post.type))
                    .map((post) => (
                        <Col span={6} key={post.url}>
                            <video src={post.url} contorls={true} className="video-block"/>
                            <p>{post.user}: {post.message}</p>
                        </Col>
                    ))
                }
            </Row>
        )
    }

    renderPosts(type) {
        const { isLoadingGeoLocation, isLoadingPosts, error, posts } = this.state;
        if (error) {
            return error;
        } else if (isLoadingGeoLocation) {
            return <Spin tip="Loading your geo location..."/>
        } else if (isLoadingPosts) {
            return <Spin tip="Loading your nearby posts..."/>
        } else if (posts.length>0) {
            return type === POST_TYPE_IMAGE ? this.renderImagePosts() : this.renderVideoPosts();
        } else {
            return 'No nearby posts found.';
        }
    }

    handleTopicChange = (e) => {
        const topic = e.target.value;
        this.setState(
            {topic}
        );
        if (topic === TOPIC_AROUND) {
            this.loadNearbyPosts();
        } else {
            this.loadFacesAroundTheWorld();
        }
    }

    loadPostsByTopic = (center, radius) => {
        if (this.state.topic === TOPIC_AROUND) {
            return this.loadNearbyPosts(center, radius);
        } else {
            return this.loadFacesAroundTheWorld();
        }
    }
      
    render() {
        const operations = ( <CreatePostButton loadPostsByTopic={this.loadPostsByTopic}/> );
        return (
            <div>
                <Radio.Group onChange={this.handleTopicChange} value={this.state.topic}>
                    <Radio value={TOPIC_AROUND}>Post Around Me</Radio>
                    <Radio value={TOPIC_FACE}>Faces Around The World</Radio>
                </Radio.Group>
                <Tabs tabBarExtraContent={operations} className="main-tabs"> 
                    <TabPane tab="Image Posts" key="1">{this.renderPosts(POST_TYPE_IMAGE)}</TabPane>
                    <TabPane tab="Video Posts" key="2">{this.renderPosts(POST_TYPE_VIDEO)}</TabPane>
                    <TabPane tab="Map" key="3">
                        <AroundMap 
                            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyD3CEh9DXuyjozqptVB5LA-dN7MxWWkr9s&v=3.exp&libraries=geometry,drawing,places"
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `600px` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            posts={this.state.posts}
                            loadPostsByTopic={this.loadPostsByTopic}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}