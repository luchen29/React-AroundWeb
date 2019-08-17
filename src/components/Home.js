import React from 'react';
import { Tabs, Spin, Row, Col } from 'antd';
import { API_ROOT, TOKEN_KEY, GEO_OPTIONS, POS_KEY, AUTH_HEADER, 
        POST_TYPE_IMAGE, POST_TYPE_VIDEO, POST_TYPE_UNKNOWN} from '../constants';
import { Gallery } from './Gallery';
import { CreatePostButton } from './CreatePostButton';
import { AroundMap } from './AroundMap';

const TabPane = Tabs.TabPane;

export class Home extends React.Component{
    state = {
        isLoadingGeoLocation: false,
        error: '',
        isLoadingPosts: false,
        posts: [],
    }

    componentDidMount(){
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
        });
        this.loadNearbyPosts();
    }

    onFailedLoadGeoLocation = () => {
        console.log("Failed to load geolocation.");
        this.setState({
            isLoadingGeoLocation: false,
            error: 'Failed to load geolocation.'
        });
    }

    loadNearbyPosts = () => {
        const { lat, lon } = JSON.parse( localStorage.getItem(POS_KEY));
        const token = localStorage.getItem(TOKEN_KEY);
        this.setState({
            isLoadingPosts: true,
            error: ''
        });
        fetch(`${API_ROOT}/search?lat=${lat}&lon=${lon}&range=20000`, 
            {
                method: 'GET',
                headers: { Authorization: `${AUTH_HEADER} ${token}` },
            }
        )
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to load posts.');
        })
        .then((data)=>{
            console.log(data);
            this.setState({
                isLoadingPosts: false,
                posts: data ? data : []
            });
        })
        .catch( (e) => {
            console.log(e.message);
            this.setState({
                error: e.message
            });
        });
    }
    renderImagePosts = () => {
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
        return (<Gallery images={images}/>);
    }

    renderVideoPosts = () => {
        const { posts } = this.state;
        return (
            <Row gutter={30}>
                {
                    posts.filter((post) => [POST_TYPE_VIDEO, POST_TYPE_UNKNOWN].includes(post.type))
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

    renderPosts = (type) => {
        const { isLoadingGeoLocation, isLoadingPosts, error, posts } = this.state;
        if (error) {
            return <div>{error}</div>
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
      
    render() {
        const operations = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
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
                        loadNearbyPosts={this.loadNearbyPosts}
                    />
                </TabPane>
            </Tabs>
        )
    }
}